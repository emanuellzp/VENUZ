<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; // Adicionar se não tiver

class Favorito extends Model
{
    use HasFactory; // Adicionar se não tiver

    protected $table = 'favoritos';

    protected $fillable = [
        'user_id', // Deve ser user_id, não usuario_id, para consistência com Auth::id()
        'quiz_id'  // Alterado de 'conteudo_id' para 'quiz_id'
    ];

    public $timestamps = false; // se não tiver `created_at` e `updated_at` na tabela

    // Relacionamentos
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}