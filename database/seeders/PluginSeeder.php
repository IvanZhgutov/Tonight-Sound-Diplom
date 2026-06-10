<?php

namespace Database\Seeders;

use App\Models\Plugin;
use Illuminate\Database\Seeder;

class PluginSeeder extends Seeder
{
    public function run(): void
    {
        $plugins = [
            ['name' => 'FabFilter Pro-Q 3',    'vendor' => 'FabFilter',          'version' => 'v3.24', 'category' => 'EQ'],
            ['name' => 'FabFilter Pro-C 2',    'vendor' => 'FabFilter',          'version' => 'v2.18', 'category' => 'Компрессор'],
            ['name' => 'FabFilter Pro-L 2',    'vendor' => 'FabFilter',          'version' => 'v2.12', 'category' => 'Мастеринг'],
            ['name' => 'FabFilter Saturn 2',   'vendor' => 'FabFilter',          'version' => 'v2.08', 'category' => 'Эффект'],
            ['name' => 'Valhalla VintageVerb', 'vendor' => 'Valhalla DSP',       'version' => 'v4.0',  'category' => 'Реверб'],
            ['name' => 'Valhalla Room',        'vendor' => 'Valhalla DSP',       'version' => 'v2.1',  'category' => 'Реверб'],
            ['name' => 'Raum',                 'vendor' => 'Native Instruments', 'version' => 'v1.4',  'category' => 'Реверб'],
            ['name' => 'Serum',                'vendor' => 'Xfer Records',       'version' => 'v1.36', 'category' => 'Синтезатор'],
            ['name' => 'Massive X',            'vendor' => 'Native Instruments', 'version' => 'v1.5',  'category' => 'Синтезатор'],
            ['name' => 'Pigments 5',           'vendor' => 'Arturia',            'version' => 'v5.1',  'category' => 'Синтезатор'],
            ['name' => 'Omnisphere 2',         'vendor' => 'Spectrasonics',      'version' => 'v2.8',  'category' => 'Синтезатор'],
            ['name' => 'Kontakt 7',            'vendor' => 'Native Instruments', 'version' => 'v7.10', 'category' => 'Синтезатор'],
            ['name' => 'Auto-Tune Pro X',      'vendor' => 'Antares',            'version' => 'v10.3', 'category' => 'Вокал'],
            ['name' => 'Melodyne 5 Studio',    'vendor' => 'Celemony',           'version' => 'v5.4',  'category' => 'Вокал'],
            ['name' => 'Nectar 4',             'vendor' => 'iZotope',            'version' => 'v4.0',  'category' => 'Вокал'],
            ['name' => 'CLA-2A',               'vendor' => 'Waves',              'version' => 'v15',   'category' => 'Компрессор'],
            ['name' => 'CLA-76',               'vendor' => 'Waves',              'version' => 'v15',   'category' => 'Компрессор'],
            ['name' => 'SSL G-Master Buss',    'vendor' => 'Waves',              'version' => 'v15',   'category' => 'Компрессор'],
            ['name' => 'Ozone 11 Advanced',    'vendor' => 'iZotope',            'version' => 'v11.1', 'category' => 'Мастеринг'],
            ['name' => 'API 550',              'vendor' => 'Waves',              'version' => 'v15',   'category' => 'EQ'],
            ['name' => 'Fresh Air',            'vendor' => 'Slate Digital',      'version' => 'v1.0',  'category' => 'EQ'],
            ['name' => 'Soothe 2',             'vendor' => 'oeksound',           'version' => 'v2.4',  'category' => 'Эффект'],
            ['name' => 'Decapitator',          'vendor' => 'Soundtoys',          'version' => 'v5.3',  'category' => 'Эффект'],
            ['name' => 'EchoBoy',              'vendor' => 'Soundtoys',          'version' => 'v5.3',  'category' => 'Эффект'],
            ['name' => 'H-Delay',              'vendor' => 'Waves',              'version' => 'v15',   'category' => 'Эффект'],
            ['name' => 'RC-20 Retro Color',    'vendor' => 'XLN Audio',          'version' => 'v1.2',  'category' => 'Эффект'],
        ];

        foreach ($plugins as $plugin) {
            Plugin::updateOrCreate(['name' => $plugin['name']], $plugin);
        }
    }
}
