<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class StudyPlan extends Model
{
    use HasFactory;

    /**
     * Caso sua tabela não seja "study_plans", descomente e ajuste:
     */
    // protected $table = 'study_plans';

    /**
     * Campos que podem ser preenchidos em mass assignment.
     *
     * @var array<int,string>
     */
    protected $fillable = [
        'user_id',
        'disciplina',
        'conteudo',
        'study_date',
    ];

    /**
     * Casts de tipos, para garantir que o campo study_date
     * venha como uma instância de Date.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'study_date' => 'date',
    ];

    /**
     * Cada plano de estudo pertence a um usuário.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
