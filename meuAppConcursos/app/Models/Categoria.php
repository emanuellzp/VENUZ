<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $table = 'categorias';

    protected $fillable = ['nome']; // ✅ Corrigido

    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'categoria_id');
    }
}
