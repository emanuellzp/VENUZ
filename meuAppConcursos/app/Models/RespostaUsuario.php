<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RespostaUsuario extends Model
{
    use HasFactory;

    protected $table = 'respostas_usuarios'; // Nome da sua tabela

    protected $fillable = [
        'user_id',
        'quiz_id',
        'resposta_dada', // Exemplo
        'acertou', // Exemplo: true/false
        // ... outros campos relevantes
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}