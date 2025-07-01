<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $table = 'quizzes'; // Certifique-se de que o nome da tabela está correto

    // É ESSENCIAL que 'user_id' esteja nesta lista para permitir a atribuição em massa
    protected $fillable = [
        'user_id', // <--- ESTA LINHA É A CHAVE! GARANTA QUE ELA ESTÁ AQUI.
        'categoria_id',
        'pergunta',
        'alternativa_a',
        'alternativa_b',
        'alternativa_c',
        'alternativa_d',
        'resposta_correta',
    ];

    // Se você não tiver um relacionamento de categoria, adicione:
    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    // Adicione o relacionamento com o usuário (opcional, mas boa prática)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
