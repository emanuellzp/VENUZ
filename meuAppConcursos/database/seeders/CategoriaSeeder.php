<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class CategoriaSeeder extends Seeder
{
    public function run()
    {
        $csv = storage_path('app/public/data/categorias.csv'); // ou database_path('data/categorias.csv')
        $file = fopen($csv, 'r');

        $firstLine = true;
        while (($data = fgetcsv($file, 1000, ',')) !== FALSE) {
            if ($firstLine) { $firstLine = false; continue; }

            DB::table('categorias')->insert([
                'id' => $data[0],
                'nome' => $data[1],
                'icone' => $data[2],
            ]);
        }

        fclose($file);
    }
}
