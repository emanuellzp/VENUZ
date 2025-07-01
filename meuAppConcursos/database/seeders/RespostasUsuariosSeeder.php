<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RespostasUsuariosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up()
{
    Schema::create('respostas_usuarios', function (Blueprint $table) {
        $table->id();
        $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
        $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
        $table->string('resposta_dada');
        $table->boolean('acertou');
        $table->timestamps();
    });
}

}
