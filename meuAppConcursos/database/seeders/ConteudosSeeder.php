<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ConteudosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up()
{
    Schema::create('conteudos', function (Blueprint $table) {
        $table->id();
        $table->string('titulo');
        $table->text('descricao')->nullable();
        $table->string('link')->nullable();
        $table->foreignId('categoria_id')->constrained('categorias')->onDelete('cascade');
        $table->timestamps();
    });
}


}
