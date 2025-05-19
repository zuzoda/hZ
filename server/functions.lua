--[[ Server ]]

Server = {
    Framework = Utils.Functions.GetFramework(),
    Functions = {},
    Players = {},
    ---@type table<number, SoldHouseType>
    SoldHouses = {},
    GeneratedSeeds = {},
    loaded = false,
}

--[[ Core Functions ]]

--- Function that executes database queries
---
--- @param query: The SQL query to execute
--- @param params: Parameters for the SQL query (in table form)
--- @param type ("insert" | "update" | "query" | "scalar" | "single" | "prepare"): Parameters for the SQL query (in table form)
--- @return query any Results of the SQL query
function Server.Functions.ExecuteSQLQuery(query, params, type)
    type = type or "query"
    -- Feltételezzük, hogy a globális MySQL az oxmysql-t jelenti és az await használható
    -- Ha nem 'MySQL' néven van exportálva, ezt át kell írni (pl. exports.oxmysql:...)
    -- Hibakezelés pcall-al
    local ok, result = pcall(function()
        if type == "insert" then
            return MySQL.insert.await(query, params)
        elseif type == "update" or type == "delete" then -- delete-et is idevesszük
             local affectedRows = MySQL.update.await(query, params)
             return affectedRows -- Vagy true, ha csak sikeresség kell
        elseif type == "scalar" then
            return MySQL.scalar.await(query, params)
        elseif type == "single" then
             return MySQL.single.await(query, params)
        -- elseif type == "prepare" then -- prepare ritkábban használt direktben így
        --     return MySQL.prepare.await(query, params)
        else -- Default to "query" (fetchAll)
            return MySQL.query.await(query, params)
        end
    end)

    if not ok then
        print(('[ERROR] SQL Hiba a következő lekérdezésnél: %s\nParaméterek: %s\nHiba: %s'):format(query, json.encode(params or {}), tostring(result)))
        -- Hibakezelés: mit adjunk vissza? Függ a hívó elvárásától.
        if type == "query" or type == "single" then return nil end
        if type == "scalar" then return nil end
        if type == "insert" then return nil end -- Vagy 0, vagy false
        if type == "update" or type == "delete" then return 0 end -- Vagy false
        return nil -- Alapértelmezett hiba visszatérés
    end
    return result -- Sikeres esetben a DB eredménye
end

function Server.Functions.SendNotify(source, title, type, duration, icon, text)
    if not duration then duration = 5000 end -- Növelt alapértelmezett időtartam
    if not Utils.Functions.CustomNotify(title, type, text, duration, icon) then
        if Utils.Functions.HasResource("ox_lib") then
             -- Használjuk az ox_lib beépített exportját a biztonság kedvéért
             exports.ox_lib:notify({
                 id = ('pixelhouse_notify_%s'):format(math.random(1, 10000)), -- Adjunk ID-t
                 title = title,
                 description = text or "", -- Legyen üres string, ha nincs text
                 duration = duration,
                 type = type, -- Pl. 'inform', 'error', 'success'
                 icon = icon -- Pl. 'fas fa-info-circle'
             }, source) -- Forrás megadása ox_lib-nek
        elseif Utils.Framework == "qb" then
            TriggerClientEvent("QBCore:Notify", source, title, type, duration) -- Adjunk hozzá duration-t, ha támogatja
        elseif Utils.Framework == "esx" then
            -- ESX showNotification talán nem támogatja a title-t vagy ikont így
            TriggerClientEvent("esx:showNotification", source, text or title, type, duration)
        end
    end
end

function Server.Functions.GetPlayerBySource(source)
    local source = tonumber(source)
    if Utils.Framework == "esx" then
        return Server.Framework.GetPlayerFromId(source)
    elseif Utils.Framework == "qb" then
        return Server.Framework.Functions.GetPlayer(source)
    end
    return nil -- Adjunk hozzá default visszatérést
end

function Server.Functions.GetPlayerSourceByIdentifier(identifier)
    local source = nil
    if Utils.Framework == "esx" then
        local xPlayer = Server.Framework.GetPlayerFromIdentifier(identifier)
        if xPlayer then
            source = xPlayer.source
        end
    elseif Utils.Framework == "qb" then
        local Player = Server.Framework.Functions.GetPlayerByIdentifier(identifier) -- Próbáljuk meg ezt a QBCore függvényt is
        if not Player then
             Player = Server.Framework.Functions.GetPlayerByCitizenId(identifier) -- Fallback a citizenid-ra
        end
        if Player and Player.PlayerData then
            source = Player.PlayerData.source
        end
    end
    return source
end

function Server.Functions.GetPlayerIdentity(source)
    if Utils.Framework == "qb" then
        return Server.Framework.Functions.GetPlayer(source)?.PlayerData?.citizenid
    elseif Utils.Framework == "esx" then
        return Server.Framework.GetPlayerFromId(source)?.identifier
    end
    return nil
end

function Server.Functions.GetPlayerCharacterName(source)
    local xPlayer = nil
    if Utils.Framework == "esx" then
        xPlayer = Server.Framework.GetPlayerFromId(source)
        return xPlayer and xPlayer.getName and xPlayer.getName() or "Ismeretlen Játékos" -- Használjuk a getName() függvényt ha van
    elseif Utils.Framework == "qb" then
        xPlayer = Server.Framework.Functions.GetPlayer(source)
        if xPlayer and xPlayer.PlayerData and xPlayer.PlayerData.charinfo then
             return xPlayer.PlayerData.charinfo.firstname .. " " .. xPlayer.PlayerData.charinfo.lastname
        end
    end
    return "Ismeretlen Játékos" -- Default érték
end

function Server.Functions.GetPlayerBalance(type, source)
    local xPlayer = nil
    if Utils.Framework == "esx" then
        xPlayer = Server.Framework.GetPlayerFromId(source)
        if not xPlayer then return 0 end
        type = (type == "cash") and "money" or type
        local account = xPlayer.getAccount(type)
        return account and account.money or 0
    elseif Utils.Framework == "qb" then
        xPlayer = Server.Framework.Functions.GetPlayer(source)
        return xPlayer?.PlayerData?.money[type] or 0
    end
    return 0
end

function Server.Functions.IsPlayerOnline(source)
    if Utils.Framework == "qb" then
        return Server.Framework.Functions.GetPlayer(source) -- Ez visszaadja a Player objektumot ha online, nil ha nem
    elseif Utils.Framework == "esx" then
        return Server.Framework.GetPlayerFromId(source) -- Ez is Player objektumot ad vissza vagy nil-t
    end
    return nil
end

function Server.Functions.PlayerRemoveMoney(Player, type, amount)
    if not Player or not amount or amount <= 0 then return false end -- Alap ellenőrzések
    amount = tonumber(amount)
    if Utils.Framework == "qb" then
        local result = Player.Functions.RemoveMoney(type, amount, cache.resource or "pixelhouse-transaction") -- Adjunk meg okot
        return result
    elseif Utils.Framework == "esx" then
        type = type == "cash" and "money" or type
        -- ESX-ben ellenőrizni kell, van-e elég pénze
        local currentAmount = Player.getAccount(type).money
        if currentAmount >= amount then
            Player.removeAccountMoney(type, amount)
            return true
        else
            return false -- Nincs elég pénz
        end
    end
    return false
end

function Server.Functions.PlayerAddMoney(Player, type, amount)
     if not Player or not amount or amount <= 0 then return false end -- Alap ellenőrzések
     amount = tonumber(amount)
    if Utils.Framework == "qb" then
        local result = Player.Functions.AddMoney(type, amount, cache.resource or "pixelhouse-transaction") -- Adjunk meg okot
        return result
    elseif Utils.Framework == "esx" then
        type = type == "cash" and "money" or type
        Player.addAccountMoney(type, amount)
        return true -- ESX add általában nem ad vissza státuszt
    end
    return false
end

function Server.Functions.DoesPlayerHaveMoney(source, amount)
    amount = tonumber(amount or 0)
    if amount <= 0 then return true end -- 0 vagy negatív összeg mindig "van"
    local balance = Server.Functions.GetPlayerBalance("bank", source) -- Ellenőrizzük a bankot
    if balance >= amount then return true end
    -- Ha csak bankot ellenőrzünk, akkor itt false. Ha a készpénz is számít, hozzáadhatnánk:
    -- balance = balance + Server.Functions.GetPlayerBalance("cash", source)
    -- return balance >= amount
    return false -- Alapból csak a bankot nézzük az eredeti kód alapján
end

--[[ Script Functions ]]

function Server.Functions.OnPlayerLogout(source)
    local src = source
    local player = Server.Players[src]
    if player then
        local houseId = player.houseId
        if houseId then
            local house = Server.SoldHouses[houseId]
            if house and house.players then -- Ellenőrizzük a players táblát is
                -- Biztonságosabb eltávolítás: hátulról előre iterálunk
                for i = #house.players, 1, -1 do
                    if house.players[i] == src then
                        table.remove(house.players, i)
                        -- break -- Ha csak egyszer lehet bent, break. Ha többször (?), ne.
                    end
                end
            end
        end
    end
    Server.Players[src] = nil
end

-- Ezt a függvényt az 0r_lib helyettesíti, de itt hagyjuk kommentben az eredetit
-- function Server.Functions.GetDefaultHouses()
--     local result = Resmon.Lib.PixelHouse.GetDefaultHouses(Config.Houses) --159 sor (EREDETI HIBA)
--     local count = 0
--     for key, value in pairs(result) do
--         count += 1
--         if type(value?.meta) ~= "table" then
--             value.meta = json.decode(value?.meta or "{}")
--         end
--     end
--     Utils.DefaultHouses = result
--     lib.print.info(string.format("%s Houses loaded.", count))
-- end

-- *** MÓDOSÍTOTT GetSoldHouses ***
-- Ez a függvény most az 0r_lib-ben lévő rekonstruált függvény eredményét dolgozza fel
function Server.Functions.GetSoldHouses()
    print("[DEBUG - 0r-pixelhouse] Server.Functions.GetSoldHouses futtatása...")
    Server.SoldHouses = {} -- Ürítjük a memóriában lévő táblát
    -- Meghívjuk a rekonstruált függvényt az 0r_lib-ben
    local result = Resmon.Lib.PixelHouse.GetSoldHouses()

    -- Itt kezdődik a biztonságos dekódoló ciklus
    if result then
        print(('[DEBUG - 0r-pixelhouse] Feldolgozásra váró eladott házak száma: %s'):format(#result))
        for i, row in ipairs(result) do -- Használjunk ipairs-t, ha lista, pairs ha asszociatív
            if row and row.houseId then -- Ellenőrizzük, hogy a sor és a houseId létezik-e
                -- JSON mezők biztonságos dekódolása pcall segítségével
                local ok, decoded
                local function safeDecode(jsonString, fieldName, houseId)
                    local data = {} -- Alapértelmezett üres tábla
                    -- Csak akkor próbálkozunk dekódolni, ha string és nem üres/alapértelmezett JSON
                    if type(jsonString) == 'string' and jsonString ~= '' and jsonString ~= '{}' and jsonString ~= '[]' then
                         ok, decoded = pcall(json.decode, jsonString)
                         if ok and type(decoded) == 'table' then
                              data = decoded
                         elseif not ok then
                              -- Hiba logolása, ha a dekódolás sikertelen
                              print(('[ERROR - 0r-pixelhouse] Sikertelen JSON dekódolás a(z) %s mezőnél! Ház ID: %s. Hiba: %s'):format(fieldName, houseId or 'N/A', tostring(decoded)))
                         else -- ok == true, de nem tábla jött vissza (pl. csak egy szám vagy string volt a JSON-ban)
                              print(('[WARN - 0r-pixelhouse] JSON dekódolás nem táblát adott vissza a(z) %s mezőnél! Ház ID: %s. Kapott típus: %s'):format(fieldName, houseId or 'N/A', type(decoded)))
                         end
                    elseif type(jsonString) == 'table' then
                         -- Ha valamiért már tábla formában lenne (nem valószínű DB-ből), megtartjuk
                         data = jsonString
                    end
                    -- Ha semmi sem sikerült, vagy üres string volt, az alapértelmezett üres táblát adja vissza
                    return data
                end

                -- Dekódolás alkalmazása a releváns mezőkre
                row.options = safeDecode(row.options, "options", row.houseId)
                row.permissions = safeDecode(row.permissions, "permissions", row.houseId) -- << Ez javította a 278-as hibát
                row.furnitures = safeDecode(row.furnitures, "furnitures", row.houseId)    -- << Ennek kell(ett) javítania a 499-es hibát
                row.indicators = safeDecode(row.indicators, "indicators", row.houseId)

                -- Futásidejű adatok inicializálása (ezek nincsenek a DB-ben, futás közben töltődnek fel)
                row.players = {}
                row.garage_players = {}

                -- Feldolgozott sor tárolása a Server.SoldHouses memóriabeli táblában
                Server.SoldHouses[row.houseId] = row
                -- print(('[DEBUG - 0r-pixelhouse] Feldolgozva és tárolva ház: %s'):format(row.houseId))
            else
                 print(('[WARN - 0r-pixelhouse] Hibás vagy hiányos sor az eladott házak eredményében, index: %s'):format(i))
            end
        end
    else
         print("[WARN - 0r-pixelhouse] Nem érkezett eredmény az 0r_lib GetSoldHouses függvényétől.")
    end
    -- *** Biztonságos dekódoló ciklus vége ***

    print("[DEBUG - 0r-pixelhouse] Server.Functions.GetSoldHouses befejezve.")
    return Server.SoldHouses
end


function Server.Functions.GetGeneratedSeed()
    local function _file()
        local filePath = GetResourcePath(cache.resource) .. "/data/design_seeds.json" -- Használjunk teljes elérési utat
        local loadedFile = LoadResourceFile(cache.resource, "data/design_seeds.json") -- LoadResourceFile a relatív utat várja
        if loadedFile then
             local ok, decoded = pcall(json.decode, loadedFile)
             if ok and type(decoded) == 'table' then
                 return decoded
             else
                 print(('[ERROR] Hiba a design_seeds.json dekódolása közben: %s'):format(tostring(decoded)))
                 -- Próbáljuk meg a fájlt átnevezni, hogy legközelebb újat hozzon létre?
                 -- local backupPath = filePath .. ".backup." .. os.time()
                 -- os.rename(filePath, backupPath) -- Ez szerver oldalon nem biztos, hogy működik így! Fájlrendszer jogok!
                 return {} -- Hiba esetén üres
             end
        end
        return {} -- Ha a fájl nem létezik vagy nem olvasható
    end
    Server.GeneratedSeeds = _file()
end

function Server.Functions.GetPlayerHouses(source)
    local soldHouses = Server.SoldHouses
    local identity = Server.Functions.GetPlayerIdentity(source)
    if not identity then return {} end -- Ha nincs identity, nincs háza sem
    local playerHouses = {}
    for houseId, house in pairs(soldHouses) do -- Iteráljunk a kulcs-érték páron
        if house and house.owner == identity then -- Ellenőrizzük, hogy a ház létezik és az övé-e
             playerHouses[houseId] = house
        end
    end
    return playerHouses
end

function Server.Functions.GetPlayerHouseCount(src)
    local playerHouses = Server.Functions.GetPlayerHouses(src)
    local count = 0
    for _ in pairs(playerHouses) do
        count = count + 1
    end
    return count
end

function Server.Functions.GetPlayerGuestHouses(source)
    local soldHouses = Server.SoldHouses
    local identity = Server.Functions.GetPlayerIdentity(source)
    if not identity then return {} end
    local guestHouses = {}
    for houseId, house in pairs(soldHouses) do
        if house and house.owner ~= identity then -- Csak ha nem ő a tulaj
             -- Ellenőrizzük, hogy szerepel-e a permissions listában (ami most már biztonságosan tábla)
             if type(house.permissions) == 'table' then
                 for _, perm in pairs(house.permissions) do
                     if perm and perm.user == identity then
                         guestHouses[houseId] = house
                         break -- Megvan, léphetünk a következő házra
                     end
                 end
             end
        end
    end
    return guestHouses
end

function Server.Functions.IsHouseSold(houseId)
    return Server.SoldHouses[houseId] ~= nil -- Elég csak azt nézni, létezik-e a kulcs
end

function Server.Functions.OnNewHouseSold(src, houseId, houseType, owner, owner_name)
    -- Itt feltételezzük, hogy a ház adatai érvényesek és a 'houseId' létezik a DefaultHouses-ban is.
    local defaultHouseData = Utils.DefaultHouses[houseId]
    if not defaultHouseData then
         print(('[ERROR] OnNewHouseSold hívva nem létező ház definícióval! houseId: %s'):format(houseId))
         return -- Ne csináljunk semmit, ha nincs alap adat
    end

    -- Adatbázis művelet
    local insertId = Server.Functions.ExecuteSQLQuery(
        "INSERT INTO `0resmon_ph_owned_houses` (houseId, type, owner, owner_name, options, permissions, furnitures, indicators) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        { houseId, houseType, owner, owner_name, '{}', '{}', '{}', '{}' }, -- Kezdjük üres JSON-okkal
        "insert"
    )

    if not insertId then
        print(('[ERROR] Sikertelen ház mentés az adatbázisba! houseId: %s'):format(houseId))
        return -- Ne folytassuk, ha a DB mentés nem sikerült
    end

    -- Memóriában lévő tábla frissítése
    local result = {
        houseId = houseId,
        type = houseType,
        owner = owner,
        owner_name = owner_name,
        options = {}, -- Üres táblák
        permissions = {},
        furnitures = {},
        indicators = {},
        players = {}, -- Üres runtime adatok
        garage_players = {}
    }
    Server.SoldHouses[houseId] = result

    -- Kliens oldali frissítések
    TriggerClientEvent(_e("Client:SetPlayerHouses"), src, Server.Functions.GetPlayerHouses(src))
    TriggerClientEvent(_e("Client:OnUpdateHouseBlip"), -1, src, houseId, "own", Server.SoldHouses) -- -1 küldi mindenkinek
end

function Server.Functions.ReceiptNewSale(src, houseId, houseType, price)
    local xPlayer = Server.Functions.GetPlayerBySource(src)
    if xPlayer then
        -- PlayerRemoveMoney már tartalmazza az ellenőrzést és false-t ad, ha nincs elég pénz
        if Server.Functions.PlayerRemoveMoney(xPlayer, "bank", price) then
            local owner = Server.Functions.GetPlayerIdentity(src)
            local owner_name = Server.Functions.GetPlayerCharacterName(src)
            if not owner or not owner_name then
                 print(('[ERROR] Nem sikerült lekérni az új tulajdonos adatait! source: %s'):format(src))
                 -- Pénzt visszatenni? Ez bonyolult lehet. Inkább logoljunk.
                 return false
            end
            Server.Functions.OnNewHouseSold(src, houseId, houseType, owner, owner_name)
            return true -- Sikeres vétel és mentés
        else
             print(('[INFO] Sikertelen vásárlás - nincs elég pénz? source: %s, houseId: %s'):format(src, houseId))
             -- Nem kell Notify, mert a DoesPlayerHaveMoney már küldött (vagy kellene küldenie a callbackben)
             return false -- Sikertelen pénzlevonás
        end
    end
    print(('[ERROR] ReceiptNewSale hívva érvénytelen játékossal! source: %s'):format(src))
    return false -- Játékos nem található
end

function Server.Functions.PlayerIsGuestInHouse(identityOrSource, houseId)
    local identity = identityOrSource
    -- Ha source-t kapunk, lekérjük az identity-t
    if type(identityOrSource) == "number" then
        identity = Server.Functions.GetPlayerIdentity(identityOrSource)
    end
    if not identity then return false end -- Ha nincs identity, nem lehet vendég

    local soldHouse = Server.SoldHouses[houseId] -- Használjuk a kisbetűs változót a konvenció miatt
    if not soldHouse then return false end -- Ha a ház nincs eladva, nem lehet vendég

    -- Először ellenőrizzük, hogy nem ő-e a tulajdonos
    if soldHouse.owner == identity then
        return true -- A tulajdonosnak mindenhez van joga
    end

    -- Ellenőrizzük a permissions listát (ami most már biztonságosan tábla)
    if type(soldHouse.permissions) == 'table' then
        for _, value in pairs(soldHouse.permissions) do
            -- Biztonsági ellenőrzés a permission bejegyzésre is
            if value and type(value) == 'table' and value.user and value.user == identity then
                return true -- Megtaláltuk a vendéglistán
            end
        end
    else
         -- Logoljunk, ha a permissions valamiért mégsem tábla (nem kellene előfordulnia a GetSoldHouses javítása után)
         print(('[WARN] PlayerIsGuestInHouse: permissions nem tábla! Ház ID: %s'):format(houseId))
    end

    return false -- Nem tulajdonos és nincs a vendéglistán
end

function Server.Functions.PlayerIsOwnerInHouse(identityOrSource, houseId)
    local identity = identityOrSource
    if type(identityOrSource) == "number" then
        identity = Server.Functions.GetPlayerIdentity(identityOrSource)
    end
    if not identity then return false end

    local soldHouse = Server.SoldHouses[houseId]
    if not soldHouse then return false end -- Nincs eladva

    return soldHouse.owner == identity -- Igaz, ha az identity megegyezik a tulajdonoséval
end

function Server.Functions.SetPlayerMeta(src, key, value)
    local tree = "inside" -- Meta kulcs neve
    if Utils.Framework == "qb" then
        local xPlayer = Server.Framework.Functions.GetPlayer(src)
        if xPlayer and xPlayer.PlayerData and xPlayer.Functions and xPlayer.Functions.SetMetaData then
            local meta = xPlayer.PlayerData.metadata or {} -- Kezeljük, ha a metadata még nem létezik
            meta[tree] = meta[tree] or {} -- Kezeljük, ha az 'inside' fa még nem létezik
            meta[tree][key] = value
            return xPlayer.Functions.SetMetaData("metadata", meta) -- Az egész metadata-t kell visszaírni? Ellenőrizd QBCore doksit! Vagy csak a 'tree'-t? Próbáljuk így: xPlayer.Functions.SetMetaData(tree, meta[tree])
        else
             print(('[ERROR] SetPlayerMeta QB: Nem található Player, PlayerData, Functions vagy SetMetaData! Source: %s'):format(src))
             return false
        end
    elseif Utils.Framework == "esx" then -- ESX (feltételezve ESX.GetPlayerFromId és set/getMeta)
        local xPlayer = Server.Framework.GetPlayerFromId(src)
        -- Ellenőrizzük a szükséges függvények létezését
        if not xPlayer or not xPlayer.getMeta or not xPlayer.setMeta then
            -- Config.MetaKeys ellenőrzés kivéve, mert nem tűnik relevánsnak itt
            print(('[ERROR] SetPlayerMeta ESX: Nem található Player vagy getMeta/setMeta függvény! Source: %s'):format(src))
            return false
        end
        -- Biztonságosabb meta kezelés
        local ok, currentMeta = pcall(xPlayer.getMeta, tree)
        if not ok then
            print(('[ERROR] SetPlayerMeta ESX: Hiba történt a(z) "%s" meta lekérdezése közben! Source: %s, Hiba: %s'):format(tree, src, tostring(currentMeta)))
            return false
        end
        -- Ha a meta nem létezik vagy nem tábla, hozzunk létre egy újat
        if type(currentMeta) ~= 'table' then
            currentMeta = {}
        end
        currentMeta[key] = value
        -- Meta visszaírása
        local okSet, errSet = pcall(xPlayer.setMeta, tree, currentMeta)
        if not okSet then
             print(('[ERROR] SetPlayerMeta ESX: Hiba történt a(z) "%s" meta beállítása közben! Source: %s, Hiba: %s'):format(tree, src, tostring(errSet)))
             return false
        end
        return true -- Sikeres beállítás
    else
         print(('[WARN] SetPlayerMeta: Ismeretlen framework: %s'):format(Utils.Framework))
         return false
    end
end

function Server.Functions.RemovePlayerMeta(src, key)
    local tree = "inside"
    if Utils.Framework == "qb" then
        local xPlayer = Server.Framework.Functions.GetPlayer(src)
        if xPlayer and xPlayer.PlayerData and xPlayer.PlayerData.metadata and xPlayer.PlayerData.metadata[tree] and xPlayer.Functions and xPlayer.Functions.SetMetaData then
            xPlayer.PlayerData.metadata[tree][key] = nil -- Töröljük a kulcsot
            -- Visszaírjuk a módosított metadata-t (vagy csak a tree-t?)
            return xPlayer.Functions.SetMetaData("metadata", xPlayer.PlayerData.metadata) -- Vagy: xPlayer.Functions.SetMetaData(tree, xPlayer.PlayerData.metadata[tree])
        else
             -- Nem logolunk hibát, ha a meta nem létezett, csak ha a játékos/függvény hiányzik
             if not xPlayer or not xPlayer.Functions or not xPlayer.Functions.SetMetaData then
                 print(('[ERROR] RemovePlayerMeta QB: Nem található Player, Functions vagy SetMetaData! Source: %s'):format(src))
             end
             return false -- Vagy true, ha a nem létező kulcs törlése "sikeres"? Legyen false.
        end
    elseif Utils.Framework == "esx" then
        local xPlayer = Server.Framework.GetPlayerFromId(src)
        if not xPlayer or not xPlayer.getMeta or not xPlayer.setMeta then
             print(('[ERROR] RemovePlayerMeta ESX: Nem található Player vagy getMeta/setMeta függvény! Source: %s'):format(src))
             return false
        end
        local ok, currentMeta = pcall(xPlayer.getMeta, tree)
        if not ok then
             print(('[ERROR] RemovePlayerMeta ESX: Hiba történt a(z) "%s" meta lekérdezése közben! Source: %s, Hiba: %s'):format(tree, src, tostring(currentMeta)))
             return false
        end
        -- Csak akkor próbálunk törölni és visszaírni, ha a meta létezett és tábla volt
        if type(currentMeta) == 'table' then
            if currentMeta[key] ~= nil then -- Csak akkor írjuk vissza, ha tényleg töröltünk valamit
                currentMeta[key] = nil
                local okSet, errSet = pcall(xPlayer.setMeta, tree, currentMeta)
                 if not okSet then
                     print(('[ERROR] RemovePlayerMeta ESX: Hiba történt a(z) "%s" meta beállítása közben! Source: %s, Hiba: %s'):format(tree, src, tostring(errSet)))
                     return false
                 end
            end
            return true -- Sikeres törlés (vagy a kulcs nem is létezett)
        else
             return true -- A fa nem létezett vagy nem tábla, nincs mit törölni
        end
    else
         print(('[WARN] RemovePlayerMeta: Ismeretlen framework: %s'):format(Utils.Framework))
         return false
    end
end

function Server.Functions.AddPlayerToHouse(src, houseId)
    local soldHouse = Server.SoldHouses[houseId]
    if soldHouse then
        -- Inicializáljuk a players táblát, ha még nem létezik
        if not soldHouse.players then
            soldHouse.players = {}
        end
        -- Adjunk hozzá csak akkor, ha még nincs bent (elkerüljük a duplikációt)
        local alreadyInside = false
        for _, playerSrc in ipairs(soldHouse.players) do
             if playerSrc == src then
                 alreadyInside = true
                 break
             end
        end
        if not alreadyInside then
            table.insert(soldHouse.players, src)
        end
    else
         print(('[WARN] AddPlayerToHouse: Nem található eladott ház! houseId: %s'):format(houseId))
         return -- Ne csináljunk semmit, ha a ház nem létezik a memóriában
    end

    -- Meta beállítása
    Server.Functions.SetPlayerMeta(src, "pixelhouse", houseId)

    -- Játékos állapotának tárolása a Server.Players táblában
    if not Server.Players[src] then
        Server.Players[src] = {}
    end
    Server.Players[src].houseId = houseId
end

function Server.Functions.RemovePlayerToHouse(src, houseId)
    local soldHouse = Server.SoldHouses[houseId]
    -- Biztonságosan eltávolítjuk a játékost a házból (ha létezik a ház és a játékosok listája)
    if soldHouse and soldHouse.players then
        for i = #soldHouse.players, 1, -1 do
            if soldHouse.players[i] == src then
                table.remove(soldHouse.players, i)
                -- break -- Ha csak egyszer lehetett bent
            end
        end
    end

    -- Meta eltávolítása
    Server.Functions.RemovePlayerMeta(src, "pixelhouse")

    -- Játékos állapotának frissítése
    if Server.Players[src] then
        Server.Players[src].houseId = nil
    end
end

function Server.Functions.AddPlayerToGarage(src, houseId)
    local soldHouse = Server.SoldHouses[houseId]
    if soldHouse then
        if not soldHouse.garage_players then
            soldHouse.garage_players = {}
        end
        -- Duplikáció ellenőrzése
        local alreadyInside = false
        for _, playerSrc in ipairs(soldHouse.garage_players) do
             if playerSrc == src then
                 alreadyInside = true
                 break
             end
        end
        if not alreadyInside then
            table.insert(soldHouse.garage_players, src)
        end
    else
        print(('[WARN] AddPlayerToGarage: Nem található eladott ház! houseId: %s'):format(houseId))
    end
end

function Server.Functions.RemovePlayerToGarage(src, houseId)
    local soldHouse = Server.SoldHouses[houseId]
    if soldHouse and soldHouse.garage_players then
        for i = #soldHouse.garage_players, 1, -1 do
            if soldHouse.garage_players[i] == src then
                table.remove(soldHouse.garage_players, i)
                -- break
            end
        end
    end
end

-- *** MÓDOSÍTOTT RegisterStash ***
function Server.Functions.RegisterStash(src, stashId)
    print(('[DEBUG] RegisterStash called for stashId: %s'):format(stashId)) -- DEBUG PRINT
    -- === Config Ellenőrzés ===
    if not Config or not Config.StashOptions or type(Config.StashOptions) ~= 'table' then
         print(('[ERROR] Config.StashOptions hiányzik vagy nem tábla a config fájlban! Stash nem regisztrálható: %s'):format(stashId))
         return -- Stop execution
    end
    if not Config.StashOptions.slots or not Config.StashOptions.maxWeight then
         print(('[ERROR] Config.StashOptions.slots vagy Config.StashOptions.maxWeight nincs definiálva! Stash nem regisztrálható: %s'):format(stashId))
         return -- Stop execution
    end
    local slots = Config.StashOptions.slots
    local maxWeight = Config.StashOptions.maxWeight
    print(('[DEBUG] Stash options - Slots: %s, Weight: %s'):format(slots, maxWeight)) -- DEBUG PRINT

    -- Check Custom Function
    local customHandled = false
    if Utils.Functions.CustomInventory and Utils.Functions.CustomInventory.RegisterStash then
        print(('[DEBUG] Trying CustomInventory.RegisterStash...'):format(stashId))
        local customOK, customResult = pcall(Utils.Functions.CustomInventory.RegisterStash, src, stashId, { maxWeight = maxWeight, slots = slots })
        if not customOK then
             print(('[ERROR] Hiba Utils.Functions.CustomInventory.RegisterStash közben: %s'):format(tostring(customResult)))
        elseif customResult == true then -- Fontos: csak akkor kezelt, ha true-t ad vissza
             print(('[DEBUG] CustomInventory.RegisterStash handled it.'):format(stashId))
             customHandled = true
        end
    end

    -- Built-in inventory checks (csak ha a custom nem kezelte)
    if not customHandled then
        print(('[DEBUG] Checking built-in inventories...'):format(stashId))
        local inventoryFound = false
        if not customHandled then
            -- ... (inventoryFound = false etc.) ...
            if Utils.Functions.HasResource("ox_inventory") then
                inventoryFound = true
                print(('[DEBUG] Found ox_inventory, attempting export call...'):format(stashId))
                local exportOK, exportErr = pcall(function()
                     if exports.ox_inventory and exports.ox_inventory.RegisterStash then
                         -- === MÓDOSÍTÁS ITT ===
                         -- Próbáltuk: {}, nil, {coords=vec3(0,0,0)}. Most jöjjön a 'false'.
                         print(('[DEBUG] Calling ox_inventory:RegisterStash(%s, %s, %s, %s, nil, nil, false) -- Options changed to false'):format(stashId, stashId, slots, maxWeight))
                         exports.ox_inventory:RegisterStash(stashId, stashId, slots, maxWeight, nil, nil, false) -- Utolsó paraméter (options) most false
                     else
                         print("[ERROR] ox_inventory export vagy RegisterStash függvény nem található!")
                         error("ox_inventory export missing")
                     end
                end)
                if not exportOK then
                    print(('[ERROR] Hiba exports.ox_inventory:RegisterStash hívása közben: %s'):format(tostring(exportErr)))
                else
                    print(('[DEBUG] ox_inventory export call successful.'):format(stashId))
                end
            -- ... (qs-inventory, origen_inventory részek változatlanok) ...
            end
            -- ... (inventoryFound ellenőrzés változatlan) ...
        end

        if not inventoryFound then
             print(('[WARN] No supported inventory found or custom handler not used for stash: %s'):format(stashId))
        end
    end
    print(('[DEBUG] RegisterStash finished for stashId: %s'):format(stashId)) -- DEBUG PRINT
end
-- *** MÓDOSÍTOTT RegisterStash VÉGE ***

-- *** MÓDOSÍTOTT RegisterFurnituresToStash ***
-- Hely: 0r-pixelhouse/server/functions.lua
function Server.Functions.RegisterFurnituresToStash(src, houseId)
    print(('[DEBUG] RegisterFurnituresToStash called for houseId %s'):format(houseId)) -- DEBUG PRINT
    local House = Server.SoldHouses[houseId]
    if House and House.furnitures and type(House.furnitures) == 'table' then
        -- Ellenőrizzük a segédfüggvények létezését a ciklus ELŐTT
        local canCheckStash = type(isModelStash) == 'function'
        local canCheckDry = type(_G['isModelWeedDry']) == 'function' -- Ellenőrizzük a globális scope-ban is
        local canGenerateString = type(generateRandomString) == 'function'

        -- generateRandomString kritikus, nélküle a stash pass nem generálható
        if not canGenerateString then
            print("[ERROR] Kritikus hiba: generateRandomString function is missing! Cannot generate stash passes.")
            -- Leállíthatnánk itt, vagy csak logolunk és a stash regisztráció nem fog működni.
            -- return -- Vagy csak hagyjuk futni, de logoltuk.
        end
        local CreateStashPass = canGenerateString and generateRandomString or function() return "random_fallback_"..math.random(10000) end -- Fallback, ha nincs meg

        if not canCheckStash then print("[WARN] isModelStash function is missing, stash models might not be registered.") end
        if not canCheckDry then print("[WARN] isModelWeedDry function is missing, dryer models might not be processed.") end

        for index, value in pairs(House.furnitures) do
            print(('[DEBUG] Processing furniture index/key: %s'):format(tostring(index)))
            if value ~= nil and type(value) == 'table' then
                if value.model then
                    print(('[DEBUG] Furniture model: %s'):format(value.model))
                    -- Stash modell ellenőrzése (csak ha a függvény létezik)
                    if canCheckStash then
                        local isStash = false
                        local okIsStash, resultIsStash = pcall(isModelStash, value.model)
                        if okIsStash then isStash = resultIsStash else print(('[ERROR] Hiba isModelStash hívása közben: %s'):format(tostring(resultIsStash))) end

                        if isStash then
                            print(('[DEBUG] Model is a stash: %s'):format(value.model))
                            value.stash_pass = value.stash_pass or CreateStashPass(10) -- Adjunk át hosszt, ha kell
                            local stashId = string.format("ph_%s_%s", houseId, value.stash_pass)
                            print(('[DEBUG] Calling Server.Functions.RegisterStash for stashId: %s'):format(stashId))
                            local okReg, errReg = pcall(Server.Functions.RegisterStash, src, stashId)
                            if not okReg then print(('[ERROR] Hiba történt a Server.Functions.RegisterStash hívása közben! Stash ID: %s, Hiba: %s'):format(stashId, tostring(errReg))) end
                            print(('[DEBUG] Returned from Server.Functions.RegisterStash for stashId: %s'):format(stashId))
                        end
                    end

                    -- Szárító modell ellenőrzése (csak ha a függvény létezik)
                    if canCheckDry then
                        local isDry = false
                        local okIsDry, resultIsDry = pcall(_G['isModelWeedDry'], value.model) -- Használjuk a _G scope-ot a biztonság kedvéért
                        if okIsDry then isDry = resultIsDry else print(('[ERROR] Hiba isModelWeedDry hívása közben: %s'):format(tostring(resultIsDry))) end

                        if isDry then
                            print(('[DEBUG] Model is a Weed Dryer: %s'):format(value.model))
                            value.dry_pass = value.dry_pass or CreateStashPass(10) -- Adjunk át hosszt, ha kell
                            -- Itt jöhetne további szárító logika...
                        end
                    end

                else
                    print(('[WARN] Hiányzó "model" mező a bútornál! Ház ID: %s, Kulcs/Index: %s'):format(houseId, tostring(index)))
                end
            else
                print(('[WARN] NIL vagy nem-tábla érték a furnitures listában! Ház ID: %s, Kulcs/Index: %s'):format(houseId, tostring(index)))
            end
        end
    else
         print(('[DEBUG] No House or valid House.furnitures found for houseId %s in RegisterFurnituresToStash'):format(houseId))
    end
    print(('[DEBUG] RegisterFurnituresToStash finished for houseId %s'):format(houseId))
end
-- *** MÓDOSÍTOTT RegisterFurnituresToStash VÉGE ***


---@param src number
---@param houseId number
function Server.Functions.GetIntoHouse(src, houseId, unauthorized)
    -- Ellenőrizzük az alapokat
    local defaultHouse = Utils.DefaultHouses[houseId]
    local soldHouse = Server.SoldHouses[houseId]
    if not defaultHouse then
         print(('[ERROR] GetIntoHouse: Nem létező alap ház definíció! houseId: %s'):format(houseId))
         -- Küldjünk hibaüzenetet a kliensnek is? A callback majd error-t ad vissza.
         return -- Ne folytassuk
    end
     if not soldHouse then
          print(('[WARN] GetIntoHouse: A ház nincs eladva (vagy hiba történt a betöltéskor). houseId: %s'):format(houseId))
          -- A callback majd error-t ad vissza.
          return
     end

    local xPlayerIdentity = Server.Functions.GetPlayerIdentity(src)
    if not xPlayerIdentity then
        print(('[ERROR] GetIntoHouse: Nem sikerült lekérni a játékos identity-jét! source: %s'):format(src))
        return
    end

    -- Mély másolás a módosítások elkerülése végett
    -- Hibakezelés hozzáadása a deepCopyhoz
    local okCopy1, houseSQL = pcall(Utils.Functions.deepCopy, soldHouse)
    local okCopy2, houseDefault = pcall(Utils.Functions.deepCopy, defaultHouse)

    if not okCopy1 or not okCopy2 then
         print(('[ERROR] GetIntoHouse: Hiba történt a ház adatok másolása közben! houseId: %s, Hiba1: %s, Hiba2: %s'):format(houseId, tostring(houseSQL), tostring(houseDefault)))
         return
    end

    -- Összeállítjuk a kliensnek küldendő adatokat
    local inHouse = houseDefault -- Induljunk az alap adatokból
    inHouse.houseId = houseId
    -- Biztonságosan másoljuk át az eladott ház adatait
    inHouse.owner = (houseSQL.owner == xPlayerIdentity)
    inHouse.owner_name = houseSQL.owner_name
    inHouse.guest = Server.Functions.PlayerIsGuestInHouse(xPlayerIdentity, houseId) -- Ez már biztonságosabb
    inHouse.options = houseSQL.options or {} -- Legyen üres tábla, ha nil
    inHouse.permissions = houseSQL.permissions or {}
    inHouse.furnitures = houseSQL.furnitures or {} -- A GetSoldHouses már biztonságosan dekódolja
    inHouse.indicators = houseSQL.indicators or {}
    inHouse.type = houseSQL.type or defaultHouse.type -- Ha valamiért hiányzik, használjuk az alap típust

    -- Enter koordináták lekérése (biztonságosan)
    local coords = nil
    local interiorConfig = Config.InteriorHouseTypes and Config.InteriorHouseTypes[string.lower(inHouse.type or "")]
    if interiorConfig and interiorConfig.enter_coords then
         coords = interiorConfig.enter_coords
    else
         print(('[ERROR] GetIntoHouse: Nem található enter_coords a "%s" típusú házhoz a Configban! houseId: %s'):format(tostring(inHouse.type), houseId))
         return -- Koordináták nélkül nem tudunk beléptetni
    end

    -- Bútor tárolók regisztrálása (már biztonságosabb verzió)
    local okStashReg, errStashReg = pcall(Server.Functions.RegisterFurnituresToStash, src, houseId)
    if not okStashReg then
         print(('[ERROR] GetIntoHouse: Hiba történt a RegisterFurnituresToStash futása közben! Hiba: %s'):format(tostring(errStashReg)))
         -- Folytatódhat-e a belépés? Talán igen, de a tárolók nem fognak működni. Logoltuk a hibát.
    end

    -- Játékos hozzáadása a házhoz (runtime)
    Server.Functions.AddPlayerToHouse(src, houseId)

    -- Játékos mozgatása és routing bucket beállítása
    local PlayerPedId = GetPlayerPed(src)
    if PlayerPedId and PlayerPedId ~= 0 then -- Ellenőrizzük, hogy a ped létezik-e
        SetEntityCoords(PlayerPedId, coords.x, coords.y, coords.z)
        SetEntityHeading(PlayerPedId, coords.w or 0.0) -- Legyen 0 a heading, ha nincs megadva
        local bucket = tonumber("22" .. houseId)
        SetPlayerRoutingBucket(src, bucket)
        -- Kliens esemény küldése (csak ha minden eddigi sikeres volt)
        TriggerClientEvent(_e("Client:OnPlayerIntoHouse"), src, inHouse, unauthorized)
        print(('[DEBUG] GetIntoHouse sikeresen végrehajtva. Játékos %s belépett a házba %s'):format(src, houseId))
    else
        print(('[ERROR] GetIntoHouse: Nem található érvényes PlayerPedId! source: %s'):format(src))
        -- Itt lehetne megpróbálni a játékost kivenni a házból, ha már hozzáadtuk
        Server.Functions.RemovePlayerToHouse(src, houseId)
    end
end

---@param src number
---@param houseId number
function Server.Functions.LeaveHouse(src, houseId)
    local defaultHouse = Utils.DefaultHouses[houseId]
    if not defaultHouse then
         print(('[WARN] LeaveHouse: Nem található alap ház definíció! houseId: %s'):format(houseId))
         -- Próbáljunk meg egy alapértelmezett kilépési pontot? Vagy csak távolítsuk el a játékost?
         Server.Functions.RemovePlayerToHouse(src, houseId) -- Távolítsuk el a belső listából
         SetPlayerRoutingBucket(src, 0) -- Állítsuk vissza az alap bucketet
         TriggerClientEvent(_e("Client:OnPlayerLeaveHouse"), src) -- Jelezzük a kliensnek
         return
    end

    -- Játékos eltávolítása a belső listából és meta törlése
    Server.Functions.RemovePlayerToHouse(src, houseId)

    -- Kilépési koordináták és mozgatás
    local coords = defaultHouse.door_coords or { x = 0.0, y = 0.0, z = 0.0 } -- Default, ha nincs door_coords
    local playerPed = GetPlayerPed(src)
    if playerPed and playerPed ~= 0 then
        SetEntityCoords(playerPed, coords.x, coords.y, coords.z)
        SetEntityHeading(playerPed, coords.w or 0.0)
        SetPlayerRoutingBucket(src, 0) -- Alap routing bucket
        TriggerClientEvent(_e("Client:OnPlayerLeaveHouse"), src)
    else
         print(('[ERROR] LeaveHouse: Nem található érvényes PlayerPedId! source: %s'):format(src))
         -- A játékos már el lett távolítva a házból logikailag, csak a mozgatás nem sikerült.
    end
end

function Server.Functions.GetHouseDetails(src, houseId)
    local soldHouse = Server.SoldHouses[houseId]
    if not soldHouse then return nil end -- Ha nincs eladva, nincs részlet

    local xPlayerIdentity = Server.Functions.GetPlayerIdentity(src)
    if not xPlayerIdentity then return soldHouse end -- Ha nincs identity, nem tudjuk megállapítani a jogokat, adjuk vissza az alap adatokat

    -- Másoljuk az adatokat, hogy ne az eredetit módosítsuk véletlenül
    local okCopy, inHouse = pcall(Utils.Functions.deepCopy, soldHouse)
    if not okCopy then
         print(('[ERROR] GetHouseDetails: Hiba történt a ház adatok másolása közben! houseId: %s, Hiba: %s'):format(houseId, tostring(inHouse)))
         return soldHouse -- Adjunk vissza valamit...
    end

    -- Jogosultságok hozzáadása a másolathoz
    inHouse.houseId = houseId -- Biztos, ami biztos
    inHouse.owner = Server.Functions.PlayerIsOwnerInHouse(xPlayerIdentity, houseId)
    inHouse.guest = Server.Functions.PlayerIsGuestInHouse(xPlayerIdentity, houseId)
    -- A többi adat (options, permissions, furnitures, indicators) már a soldHouse-ban van feldolgozva

    return inHouse
end

function Server.Functions.UpdateHouseOptions(options, houseId)
    local House = Server.SoldHouses[houseId]
    if not House then
         print(('[WARN] UpdateHouseOptions: A ház nem található a memóriában! houseId: %s'):format(houseId))
         return
    end

    -- Memóriában frissítés (fontos, hogy az 'options' már tábla legyen itt)
    House.options = options or {}

    -- Kliensek értesítése a házban
    for _, source in pairs(House.players or {}) do
        if Server.Functions.IsPlayerOnline(source) then
            -- Küldjük a frissített részleteket, ami tartalmazza az új opciókat
            local inHouseDetails = Server.Functions.GetHouseDetails(source, houseId)
            if inHouseDetails then
                 TriggerClientEvent(_e("Client:OnChangeHouseDetails"), source, inHouseDetails)
            end
        end
    end

    -- Adatbázis frissítése (biztonságos JSON kódolással)
    local optionsJson = "{}"
    local okEncode, encoded = pcall(json.encode, House.options) -- Használjuk a memóriában frissített értéket
    if okEncode then
        optionsJson = encoded
    else
        print(('[ERROR] UpdateHouseOptions: Hiba történt az options JSON kódolása közben! houseId: %s, Hiba: %s'):format(houseId, tostring(encoded)))
        -- Ne írjuk felül hibás JSON-nal az adatbázist? Vagy mentsünk üreset? Maradjon a régi?
        return -- Inkább ne csináljunk DB update-et hiba esetén
    end

    Server.Functions.ExecuteSQLQuery(
        "UPDATE `0resmon_ph_owned_houses` SET options = ? WHERE houseId = ?",
        { optionsJson, houseId },
        "update"
    )
end

function Server.Functions.UpdateHouseLights(state, houseId)
    local House = Server.SoldHouses[houseId]
    if not House then return end -- Ház nem létezik

    -- Opciók inicializálása, ha szükséges
    if not House.options then House.options = {} end

    -- Érték beállítása
    House.options.lights = state

    -- Közös frissítő függvény hívása (memória + DB + kliens értesítés)
    Server.Functions.UpdateHouseOptions(House.options, houseId)

    -- Kliensek értesítése a konkrét változásról is (ez lehet redundáns az OnChangeHouseDetails mellett)
    -- De megtartjuk, hátha a kliens specifikusan erre figyel
    for _, source in pairs(House.players or {}) do
        if Server.Functions.IsPlayerOnline(source) then
            TriggerClientEvent(_e("Client:SetHouseLights"), source, state)
        end
    end
end

function Server.Functions.UpdateHouseStairs(state, houseId)
    local House = Server.SoldHouses[houseId]
    if not House then return end
    if not House.options then House.options = {} end
    House.options.stairs = state
    Server.Functions.UpdateHouseOptions(House.options, houseId)

    for _, source in pairs(House.players or {}) do
        if Server.Functions.IsPlayerOnline(source) then
            TriggerClientEvent(_e("Client:SetHouseStairs"), source, House.type, state)
        end
    end
end

function Server.Functions.UpdateHouseRooms(state, houseId)
    local House = Server.SoldHouses[houseId]
    if not House then return end
    if not House.options then House.options = {} end
    House.options.rooms = state
    Server.Functions.UpdateHouseOptions(House.options, houseId)

    for _, source in pairs(House.players or {}) do
        if Server.Functions.IsPlayerOnline(source) then
            TriggerClientEvent(_e("Client:SetHouseRooms"), source, House.type, state)
        end
    end
end

-- Hely: 0r-pixelhouse/server/functions.lua
function Server.Functions.UpdateHouseIndicator(type, unit, houseId)
    local House = Server.SoldHouses[houseId]
    if not House then print(('[WARN] UpdateHouseIndicator: Ház nem található! houseId: %s'):format(houseId)) return nil end

    -- === NIL TÍPUS ELLENŐRZÉS ===
    if type == nil then
         print(('[ERROR] UpdateHouseIndicator hívva NIL típus argumentummal! houseId: %s'):format(houseId))
         return nil -- Visszatérés nil-lel hiba esetén
    end
    unit = tonumber(unit or 0) -- Biztosítjuk, hogy unit szám legyen

    -- Indikátorok inicializálása
    if not House.indicators then House.indicators = {} end
    if not House.indicators[type] then House.indicators[type] = 0 end

    -- Érték frissítése (most már biztonságosabb az indexelés)
    local newValue = House.indicators[type] + unit
    House.indicators[type] = newValue

    -- Kliensek értesítése a házban
    for _, source in pairs(House.players or {}) do
        if Server.Functions.IsPlayerOnline(source) then
            local inHouseDetails = Server.Functions.GetHouseDetails(source, houseId)
            if inHouseDetails then
                 TriggerClientEvent(_e("Client:OnChangeHouseDetails"), source, inHouseDetails)
            end
        end
    end

    -- Adatbázis frissítése
    local indicatorsJson = "{}"
    local okEncode, encoded = pcall(json.encode, House.indicators)
    if okEncode then
        indicatorsJson = encoded
    else
        print(('[ERROR] UpdateHouseIndicator: Hiba történt az indicators JSON kódolása közben! houseId: %s, Hiba: %s'):format(houseId, tostring(encoded)))
        -- DB nem frissül, de az új értéket visszaadjuk
    end
    Server.Functions.ExecuteSQLQuery(
        "UPDATE `0resmon_ph_owned_houses` SET indicators = ? WHERE houseId = ?",
        { indicatorsJson, houseId },
        "update"
    )

    return House.indicators[type] -- Visszaadjuk az új értéket
end

function Server.Functions.UpdateHouseTint(color, houseId)
    local House = Server.SoldHouses[houseId]
    if not House then return end
    if not House.options then House.options = {} end
    House.options.tint = color
    Server.Functions.UpdateHouseOptions(House.options, houseId) -- Ez már értesíti a klienseket is az OnChangeHouseDetails-el

    -- Specifikus esemény küldése is (redundáns lehet, de megtartjuk)
    for _, source in pairs(House.players or {}) do
        if Server.Functions.IsPlayerOnline(source) then
            TriggerClientEvent(_e("Client:SetHouseWallColor"), source, House.type, color)
        end
    end
end

function Server.Functions.UpdateHousePermissions(permissions, houseId)
    local House = Server.SoldHouses[houseId]
    if not House then
         print(('[WARN] UpdateHousePermissions: Ház nem található! houseId: %s'):format(houseId))
         return
    end

    -- Memóriában frissítés (feltételezzük, 'permissions' egy valid tábla)
    House.permissions = permissions or {}

    -- Kliensek értesítése
    for _, source in pairs(House.players or {}) do
        if Server.Functions.IsPlayerOnline(source) then
            local inHouseDetails = Server.Functions.GetHouseDetails(source, houseId)
            if inHouseDetails then
                 TriggerClientEvent(_e("Client:OnChangeHouseDetails"), source, inHouseDetails)
            end
        end
    end

    -- Adatbázis frissítése
    local permissionsJson = "{}"
    local okEncode, encoded = pcall(json.encode, House.permissions)
    if okEncode then
        permissionsJson = encoded
    else
         print(('[ERROR] UpdateHousePermissions: Hiba történt a permissions JSON kódolása közben! houseId: %s, Hiba: %s'):format(houseId, tostring(encoded)))
         return -- Ne írjuk felül hibás adattal
    end

    Server.Functions.ExecuteSQLQuery(
        "UPDATE `0resmon_ph_owned_houses` SET permissions = ? WHERE houseId = ?",
        { permissionsJson, houseId },
        "update"
    )
end

-- *** MÓDOSÍTOTT UpdateHouseFurnitures ***
function Server.Functions.UpdateHouseFurnitures(furnitures, houseId)
    local House = Server.SoldHouses[houseId]
    if not House then
         print(('[WARN] UpdateHouseFurnitures: Ház nem található! houseId: %s'):format(houseId))
         return
    end

    -- Memóriában frissítés (feltételezzük, 'furnitures' egy valid tábla)
    House.furnitures = furnitures or {}

    -- Kliensek értesítése
    for _, playerSource in pairs(House.players or {}) do -- Biztonságosabb hivatkozás
        if Server.Functions.IsPlayerOnline(playerSource) then
            local inHouseDetails = Server.Functions.GetHouseDetails(playerSource, houseId)
            if inHouseDetails then
                 TriggerClientEvent(_e("Client:OnChangeHouseDetails"), playerSource, inHouseDetails)
            end
        end
    end

    -- Adatbázisra szánt másolat készítése és tisztítása
    local furnituresCopy = {}
    local okCopy, copiedData = pcall(Utils.Functions.deepCopy, House.furnitures)
    if okCopy then
         furnituresCopy = copiedData
    else
         print(('[ERROR] UpdateHouseFurnitures: Hiba a bútoradatok másolása közben! houseId: %s, Hiba: %s'):format(houseId, tostring(copiedData)))
         -- Használjuk az eredetit, de ez kockázatos lehet
         furnituresCopy = House.furnitures
    end

    local needsCleanup = false -- Jelző, ha eltávolítottunk valamit
    -- Objektum ID és index eltávolítása + nil/nem-tábla elemek kiszűrése
    for key, value in pairs(furnituresCopy) do
        if value ~= nil and type(value) == 'table' then
            -- Itt már nem kell ellenőrizni objectId és index létezését, nil-re állításuk biztonságos
            value.objectId = nil
            value.index = nil
            furnituresCopy[key] = value -- Visszaírjuk a módosítottat (lehet redundáns, de biztos)
        else
            print(('[WARN] NIL vagy nem-tábla érték a furnitures listában (Update)! Ház ID: %s, Kulcs: %s, Eltávolítva a mentésből.'):format(houseId, tostring(key)))
            furnituresCopy[key] = nil -- Ténylegesen eltávolítjuk a másolatból
            needsCleanup = true
        end
    end

    -- JSON kódolás és adatbázis frissítés
    local furnituresJson = "{}"
    local okEncode, encoded = pcall(json.encode, furnituresCopy)
    if okEncode then
        furnituresJson = encoded
    else
        print(('[ERROR] UpdateHouseFurnitures: Hiba történt a furnitures JSON kódolása közben! houseId: %s, Hiba: %s'):format(houseId, tostring(encoded)))
        return -- Ne írjuk felül hibás adattal
    end

    Server.Functions.ExecuteSQLQuery(
        "UPDATE `0resmon_ph_owned_houses` SET furnitures = ? WHERE houseId = ?",
        { furnituresJson, houseId },
        "update"
    )

    -- Ha takarítás volt, a memóriában lévőt is frissíthetjük a tisztítottra,
    -- bár ez lehet, hogy nem kívánatos, ha a user csak ideiglenesen akart valamit kivenni.
    -- Maradjunk annál, hogy a House.furnitures az "igazi" állapotot tükrözi, a DB a mentettet.
end
-- *** MÓDOSÍTOTT UpdateHouseFurnitures VÉGE ***

-- *** MÓDOSÍTOTT UpdateHouseOwner ***
function Server.Functions.UpdateHouseOwner(src, targetIdentity, houseId)
    -- Helper function to find guest info safely
    local function GetGuestInfo(permissions, identity)
        if type(permissions) ~= 'table' then -- Ensure permissions is a table
             print(('[ERROR] GetGuestInfo received invalid permissions argument (not a table)! House ID: %s'):format(houseId))
             return nil -- Return nil on error
        end
        for _, value in pairs(permissions) do
            -- Check value, type, and user field existence
            if value ~= nil and type(value) == 'table' and value.user then
                if value.user == identity then
                    return value -- Return the permission entry table
                end
            else
                print(('[WARN] Invalid or incomplete permission entry found! House ID: %s'):format(houseId))
            end
        end
        return nil -- Return nil if not found
    end

    local xPlayerIdentity = Server.Functions.GetPlayerIdentity(src)
    local xPlayerName = Server.Functions.GetPlayerCharacterName(src)
    local House = Server.SoldHouses[houseId]

    if not House or not House.permissions then
        print(('[ERROR] UpdateHouseOwner: House or permissions not found! houseId: %s'):format(houseId))
        return -- Cannot proceed
    end

    -- Get target guest info safely
    local GuestInfo = GetGuestInfo(House.permissions, targetIdentity)

    if not GuestInfo then
         print(('[ERROR] UpdateHouseOwner: Target identity %s not found in permissions for house %s!'):format(targetIdentity, houseId))
         -- Trigger error notify? The callback should handle this.
         return
    end

    local targetPlayerName = GuestInfo.playerName -- Get name before removing from permissions

    -- Remove target from permissions list
    local found = false
    for key = #House.permissions, 1, -1 do -- Iterate backwards for safe removal
        if House.permissions[key] and House.permissions[key].user == targetIdentity then
            table.remove(House.permissions, key)
            found = true
            -- break -- Assuming only one entry per user
        end
    end
    if not found then
        print(('[WARN] UpdateHouseOwner: Target identity %s was not found in permissions during removal phase (should have been found by GetGuestInfo)! houseId: %s'):format(targetIdentity, houseId))
        -- Proceed anyway, as GetGuestInfo found them.
    end

    -- Add original owner to permissions list
    table.insert(House.permissions, {
        user = xPlayerIdentity,
        playerName = xPlayerName,
    })

    -- Update house owner details in memory
    House.owner_name = targetPlayerName -- Use the name retrieved earlier
    House.owner = targetIdentity

    -- Update database
    local permissionsJson = "{}"
    local okEncode, encoded = pcall(json.encode, House.permissions)
    if okEncode then
        permissionsJson = encoded
    else
        print(('[ERROR] UpdateHouseOwner: Failed to encode permissions to JSON! houseId: %s, Error: %s'):format(houseId, tostring(encoded)))
        -- Should we revert changes? Difficult. Logged the error. DB won't be updated correctly.
        return
    end

    Server.Functions.ExecuteSQLQuery(
        "UPDATE `0resmon_ph_owned_houses` SET owner = ?, owner_name = ?, permissions = ? WHERE houseId = ?",
        { targetIdentity, targetPlayerName, permissionsJson, houseId },
        "update"
    )

    -- Notify players
    local xNewOwnerSource = Server.Functions.GetPlayerSourceByIdentifier(targetIdentity)
    if xNewOwnerSource then
        TriggerClientEvent(_e("Client:OnUpdateGuestHouses"), xNewOwnerSource, houseId, nil) -- Remove from guest
        TriggerClientEvent(_e("Client:OnUpdateOwnedHouses"), xNewOwnerSource, houseId, true) -- Add to owned
        Server.Functions.SendNotify(xNewOwnerSource, locale("owner_transfered_house"), "success", 5000) -- Longer duration
    end

    -- Notify original owner (src)
    TriggerClientEvent(_e("Client:OnUpdateGuestHouses"), src, houseId, true) -- Add to guest
    TriggerClientEvent(_e("Client:OnUpdateOwnedHouses"), src, houseId, nil) -- Remove from owned
    Server.Functions.SendNotify(src, locale("owner_transfered_house"), "success", 5000)

    -- Update details for players inside the house
    for _, sourceInside in pairs(House.players or {}) do
        if Server.Functions.IsPlayerOnline(sourceInside) then
            local inHouseDetails = Server.Functions.GetHouseDetails(sourceInside, houseId)
            if inHouseDetails then
                 TriggerClientEvent(_e("Client:OnChangeHouseDetails"), sourceInside, inHouseDetails)
            end
        end
    end
end
-- *** MÓDOSÍTOTT UpdateHouseOwner VÉGE ***


function Server.Functions.GivePermToTarget(src, targetId, houseId)
    local xTargetIdentity = Server.Functions.GetPlayerIdentity(targetId)
    if not xTargetIdentity then return nil, "Target player not found" end -- Return error message
    local xTargetName = Server.Functions.GetPlayerCharacterName(targetId)
    local house = Server.SoldHouses[houseId]
    if not house then return nil, "House not found" end

    -- Check if already guest or owner
    if Server.Functions.PlayerIsGuestInHouse(xTargetIdentity, houseId) then
         return nil, locale("already_guest_house")
    end

    local newPerm = {
        user = xTargetIdentity,
        playerName = xTargetName,
    }
    -- Ensure permissions table exists
    if not house.permissions then house.permissions = {} end
    table.insert(house.permissions, newPerm)

    -- Update permissions in DB and notify clients
    Server.Functions.UpdateHousePermissions(house.permissions, houseId)

    Server.Functions.SendNotify(src, locale("gived_perm_to_player"), "success")
    -- Notify target player
    TriggerClientEvent(_e("Client:OnUpdateHouseGuest"), targetId, houseId, true)
    return newPerm -- Return the permission added
end

function Server.Functions.DeletePermToTarget(src, userId, houseId)
    local xTargetIdentity = userId -- Assume userId is the identifier string
    local house = Server.SoldHouses[houseId]
    if not house or not house.permissions then return false, "House or permissions not found" end

    local permissionRemoved = false
    for key = #house.permissions, 1, -1 do -- Iterate backwards
        if house.permissions[key] and house.permissions[key].user == xTargetIdentity then
            table.remove(house.permissions, key)
            permissionRemoved = true
            break -- Assume only one entry per user
        end
    end

    if not permissionRemoved then
         return false, locale("already_not_guest_house") -- Or "Permission entry not found"
    end

    -- Update permissions in DB and notify clients
    Server.Functions.UpdateHousePermissions(house.permissions, houseId)

    Server.Functions.SendNotify(src, locale("deleted_perm_to_player"), "success")
    -- Notify target player if online
    local xTargetSource = Server.Functions.GetPlayerSourceByIdentifier(xTargetIdentity)
    if xTargetSource then
        TriggerClientEvent(_e("Client:OnUpdateHouseGuest"), xTargetSource, houseId, nil)
    end
    return true -- Indicate success
end

function Server.Functions.LeaveHousePermanently(src, houseId)
    local house = Server.SoldHouses[houseId]
    if not house then return false, "House not found" end -- Add error check

    -- Make a copy of players before modifying/deleting house data
    local playersInside = {}
    if house.players then
         playersInside = Utils.Functions.deepCopy(house.players)
    end

    -- Delete from owned houses first
    local affectedRows = Server.Functions.ExecuteSQLQuery(
        "DELETE FROM `0resmon_ph_owned_houses` WHERE houseId = ?",
        { houseId },
        "delete" -- Use 'delete' type for clarity, though 'query' might work
    )

    if not affectedRows or affectedRows == 0 then
         print(('[WARN] LeaveHousePermanently: Nem sikerült törölni a házat az adatbázisból, vagy nem létezett. houseId: %s'):format(houseId))
         -- Should we proceed? Maybe the house was already deleted from DB. Let's continue removing from memory.
    end

    -- Remove from memory
    Server.SoldHouses[houseId] = nil

    -- Kick players out if they are online
    for _, source in pairs(playersInside) do
        if Server.Functions.IsPlayerOnline(source) then
            -- LeaveHouse handles removing from lists and moving the player
            Server.Functions.LeaveHouse(source, houseId)
            TriggerClientEvent(_e("Client:OnLeaveHousePermanently"), source, houseId)
            Server.Functions.SendNotify(source, locale("house_deleted_by_owner"), "error", 7000) -- Notify player
        end
    end

    -- Update blips for everyone
    TriggerClientEvent(_e("Client:OnUpdateHouseBlip"), -1, src, houseId, "sale", Server.SoldHouses)

    --[[ WEED DLC - Add checks and pcall for safety ]]
    if Utils.Functions.HasResource("0r-weed") then
        local zoneId = string.format("pixelhouse_%s", houseId)
        print(('[INFO] Attempting to delete weed plants/dryers for zone: %s'):format(zoneId))
        local ok1, err1 = pcall(Server.Functions.ExecuteSQLQuery, "DELETE FROM `0resmon_weed_plants` WHERE zoneId = ?", { zoneId }, "delete")
        if not ok1 then print(('[ERROR] Failed to delete weed plants: %s'):format(tostring(err1))) end
        local ok2, err2 = pcall(Server.Functions.ExecuteSQLQuery, "DELETE FROM `0resmon_weed_dryers` WHERE zoneId = ?", { zoneId }, "delete")
        if not ok2 then print(('[ERROR] Failed to delete weed dryers: %s'):format(tostring(err2))) end
    end

    return true -- Indicate success
end

function Server.Functions.SaveDesignSeeds()
    local filePath = "data/design_seeds.json" -- Relative path for SaveResourceFile
    local seeds = Server.GeneratedSeeds or {} -- Ensure it's a table
    local okEncode, seedsJson = pcall(json.encode, seeds, { pretty = true }) -- Use pretty print for readability
    if okEncode then
        local success = SaveResourceFile(cache.resource, filePath, seedsJson, -1)
        if success then
            print("[INFO] Design seeds saved successfully.")
        else
            print("[ERROR] Failed to save design seeds to file!")
        end
    else
        print(('[ERROR] Failed to encode design seeds to JSON: %s'):format(tostring(seedsJson)))
    end
end

function Server.Functions.GetGarageVehicles(src, houseId)
    local garage = string.format("pixel_garage_%s", houseId)
    local state = 3 -- Stored state (3 often means inside a non-impound garage)
    local vehicleTable = Utils.Framework == "qb" and "player_vehicles" or "owned_vehicles"
    local garageField = Utils.Framework == "qb" and "garage" or "parking" -- 'parking' for esx_advancedgarage? Check config maybe.
    local stateField = Utils.Framework == "qb" and "state" or "stored" -- 'stored' = 1 usually means in garage for ESX? Double check this logic. 'state = 3' might be QBCore specific.

    -- Adjust 'state' based on framework if needed
    if Utils.Framework == "esx" then
         state = 1 -- Standard ESX garage stored state is often 1
         print("[DEBUG] GetGarageVehicles: Using ESX state=1")
    else
         print("[DEBUG] GetGarageVehicles: Using QB state=3")
    end

    local checkGarageQuery = string.format("SELECT * FROM %s WHERE %s = ? AND %s = ?", vehicleTable, garageField, stateField)
    local garageVehicles = Server.Functions.ExecuteSQLQuery(checkGarageQuery, { garage, state }, "query")

    -- Decode vehicle data if needed (ESX stores mods in 'vehicle' column as JSON)
    if Utils.Framework == "esx" and garageVehicles then
        for i = 1, #garageVehicles do
             if garageVehicles[i].vehicle and type(garageVehicles[i].vehicle) == 'string' then
                 local ok, decoded = pcall(json.decode, garageVehicles[i].vehicle)
                 if ok then
                     garageVehicles[i].vehicle = decoded
                 else
                      print(('[ERROR] Failed to decode vehicle data JSON for plate %s: %s'):format(garageVehicles[i].plate or 'N/A', tostring(decoded)))
                      garageVehicles[i].vehicle = {} -- Set to empty table on error
                 end
             end
        end
    end

    return garageVehicles or {} -- Return empty table if query fails or returns nil
end

--[[ Core Thread]]
CreateThread(function()
    -- Wait for dependencies like ox_lib and the framework core to be ready
    -- Checking for Resmon might be leftover if 0r_lib replaced it
    -- Let's wait for ox_lib instead, as it's used for locale and callbacks
    while not exports.ox_lib do
        print("[WAITING] Waiting for ox_lib to load...")
        Wait(500)
    end
    print("[INFO] ox_lib loaded.")

    -- Wait for framework (ESX or QBCore) - this part needs reliable detection
    local frameworkReady = false
    local attempts = 0
    while not frameworkReady and attempts < 20 do -- Wait max 10 seconds
         Server.Framework = Utils.Functions.GetFramework()
         if Server.Framework then
             -- Check if essential framework functions are available
             if Utils.Framework == "esx" and Server.Framework.GetPlayerFromId then
                 frameworkReady = true
                 print("[INFO] ESX Framework seems ready.")
             elseif Utils.Framework == "qb" and Server.Framework.Functions and Server.Framework.Functions.GetPlayer then
                 frameworkReady = true
                 print("[INFO] QBCore Framework seems ready.")
             else
                 print(('[WARN] Framework detected (%s), but essential functions might not be ready yet. Waiting...'):format(Utils.Framework))
             end
         else
             print("[WAITING] Waiting for framework (ESX/QBCore) to load...")
         end
         if not frameworkReady then
             Wait(500)
             attempts = attempts + 1
         end
    end

    if not frameworkReady then
         print("[FATAL ERROR] Framework (ESX/QBCore) did not load correctly after waiting. 0r-pixelhouse cannot start properly.")
         return -- Stop initialization
    end

    -- Now load locale using ox_lib
    lib.locale(Config.Locale, Utils.DefaultLocale) -- Use locale defined in config

    Server.loaded = false -- Set loaded to false initially

    -- Load data (houses, seeds) - these now depend on Resmon.Lib which comes from 0r_lib
    -- Need to make sure 0r_lib is fully initialized FIRST. How to check?
    -- Assuming 0r_lib sets up Resmon.Lib synchronously on start.
    -- Let's add a small safety wait after framework confirmation.
    Wait(1000) -- Small delay

    -- Check if Resmon.Lib and necessary functions exist (from 0r_lib reconstruction)
    if not Resmon or not Resmon.Lib or not Resmon.Lib.PixelHouse or not Resmon.Lib.PixelHouse.GetDefaultHouses or not Resmon.Lib.PixelHouse.GetSoldHouses then
        print("[FATAL ERROR] Required functions from 0r_lib (Resmon.Lib.PixelHouse.GetDefaultHouses/GetSoldHouses) are missing! Ensure 0r_lib started correctly and contains the reconstructed code.")
        return -- Stop initialization
    end

    print("[INFO] Starting to load house data...")
    -- Get Default Houses (using reconstructed function in 0r_lib)
    local okDef, defaultHousesResult = pcall(Resmon.Lib.PixelHouse.GetDefaultHouses, Config.Houses) -- Pass Config.Houses just in case
    if okDef and defaultHousesResult then
        local count = 0
        Utils.DefaultHouses = defaultHousesResult -- Store the result directly
        -- Process meta data (decode JSON) if needed - reconstruction might already do this
        for houseId, value in pairs(Utils.DefaultHouses) do
            count = count + 1
            if value.meta and type(value.meta) == 'string' then
                local okMeta, decodedMeta = pcall(json.decode, value.meta)
                if okMeta and type(decodedMeta) == 'table' then
                    Utils.DefaultHouses[houseId].meta = decodedMeta
                else
                    print(('[WARN] Failed to decode meta JSON for default house %s: %s'):format(houseId, value.meta))
                    Utils.DefaultHouses[houseId].meta = {} -- Set empty table on error
                end
            elseif type(value.meta) ~= 'table' then
                 Utils.DefaultHouses[houseId].meta = {} -- Ensure meta is always a table
            end
        end
        print(('[INFO] %s Default Houses processed.'):format(count))
    else
        print(('[FATAL ERROR] Failed to execute Resmon.Lib.PixelHouse.GetDefaultHouses! Error: %s. Check 0r_lib.'):format(tostring(defaultHousesResult)))
        Utils.DefaultHouses = {} -- Set empty to avoid errors later
        -- Decide whether to stop initialization
        -- return
    end

    -- Get Sold Houses (processing happens in Server.Functions.GetSoldHouses now)
    local okSold = pcall(Server.Functions.GetSoldHouses)
    if not okSold then
         print("[FATAL ERROR] Failed to execute Server.Functions.GetSoldHouses! Check errors above.")
         -- Server.SoldHouses should be {} due to init inside the function
         -- Decide whether to stop initialization
         -- return
else
        -- Új, biztonságosabb számolás:
        local soldCount = 0
        for _ in pairs(Server.SoldHouses or {}) do soldCount = soldCount + 1 end -- Kezeli, ha Server.SoldHouses nil lenne
        print(('[INFO] Sold Houses processed. Count: %s'):format(soldCount)) -- <<< EZ AZ ÚJ, JAVÍTOTT SOR
    end

    -- Get Generated Seeds
    pcall(Server.Functions.GetGeneratedSeed) -- Use pcall for safety

    print("[INFO] 0r-pixelhouse initialization complete.")
    Server.loaded = true
end)