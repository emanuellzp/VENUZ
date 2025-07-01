<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategoriasSeeder::class,
            UsuariosSeeder::class,
            ConteudosSeeder::class,
            QuizzesSeeder::class,
            RespostasUsuariosSeeder::class,
            FavoritosSeeder::class,
            RankingSeeder::class,
        ]);
    }
}
