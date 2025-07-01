<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudyPlansTable extends Migration
{
    public function up()
    {
        Schema::create('study_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->string('disciplina');
            $table->text('conteudo');
            $table->date('study_date');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('study_plans');
    }
}
