<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FavoritosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up()
{
    Schema::create('favoritos', function (Blueprint $table) {
        $table->id();
        $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
        $table->foreignId('conteudo_id')->constrained('conteudos')->onDelete('cascade');
        $table->timestamps();
    });
}


}
