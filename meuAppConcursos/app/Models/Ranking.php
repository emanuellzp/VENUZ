<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ranking extends Model
{
    protected $table = 'ranking';

    public $timestamps = false; // A tabela não tem created_at e updated_at

    protected $fillable = [
        'usuario_id',
        'pontuacao',
        'ultima_atualizacao'
    ];
}
