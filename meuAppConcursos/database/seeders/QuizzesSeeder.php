<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizzesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up()
{
    Schema::create('quizzes', function (Blueprint $table) {
        $table->id();
        $table->text('pergunta');
        $table->string('alternativa_a')->nullable();
        $table->string('alternativa_b')->nullable();
        $table->string('alternativa_c')->nullable();
        $table->string('alternativa_d')->nullable();
        $table->string('resposta_correta');
        $table->foreignId('categoria_id')->constrained('categorias')->onDelete('cascade');
        $table->timestamps();
    });
}


}
