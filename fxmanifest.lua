fx_version "cerulean"
lua54 "yes"
game "gta5"
name "0r-pixelhouse"
author "0Resmon | aliko."
version "1.2.4"
description "Fivem, Pixel House script | 0resmon | aliko.<Discord>"

shared_scripts {
	"@ox_lib/init.lua",
	"shared/**/*",
}

client_scripts {
	"client/utils.lua",
	"client/functions.lua",
	"client/events.lua",
	"client/nui.lua",
	"client/threads.lua",
	"client/commands.lua",
	"client/furniture.lua",
	"client/exports.lua",
	"modules/bridge/**/client.lua",
}

server_scripts {
	"@oxmysql/lib/MySQL.lua",
	"server/utils.lua",
	"server/functions.lua",
	"server/events.lua",
	"server/commands.lua",
	"server/furniture.lua",
	"server/exports.lua",
	"modules/bridge/**/server.lua",
}

ui_page "ui/build/index.html"

files {
	"data/**/*",
	"locales/**/*",
	"ui/build/index.html",
	"ui/build/**/*",
}

escrow_ignore {
	"client/**/*",
	"server/**/*",
	"locales/**/*",
	"shared/**/*",
	"modules/**/*"
}

dependencies {
	"ox_lib",
	"0r_lib",
	"object_gizmo"
}

dependency '/assetpacks'