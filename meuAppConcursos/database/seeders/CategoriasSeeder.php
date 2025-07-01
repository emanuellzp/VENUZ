<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriasSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categorias')->insert([
            ['nome' => 'Língua Portuguesa', 'icone' => '📘'],
            ['nome' => 'Raciocínio Lógico', 'icone' => '🧠'],
            ['nome' => 'Informática', 'icone' => '💻'],
            ['nome' => 'Direitos', 'icone' => '⚖️'],
        ]);
    }
}
