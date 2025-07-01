<?php
// C:\Users\Fabio Emanuell\OneDrive\Documentos\IFTO\Desenvolvimento de app\meuAppConcursos\app\Http\Controllers - QuizPlayController.php
namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Categoria;
use Illuminate\Http\Request;

class QuizPlayController extends Controller
{
    /**
     * Retorna 5 questões aleatórias formatadas.
     */
    public function getRandomQuiz()
    {
        $quizzes = Quiz::inRandomOrder()
                       ->limit(5)
                       ->get();

        return response()->json($this->format($quizzes));
    }

    /**
     * Retorna 5 questões aleatórias de uma categoria.
     */
    public function getByCategory($id)
    {
        if (! Categoria::find($id)) {
            return response()->json(['mensagem' => 'Categoria não encontrada'], 404);
        }

        $quizzes = Quiz::where('categoria_id', $id)
                       ->inRandomOrder()
                       ->limit(5)
                       ->get();

        if ($quizzes->isEmpty()) {
            return response()->json(['mensagem' => 'Nenhuma pergunta para esta categoria'], 404);
        }

        return response()->json($this->format($quizzes));
    }

    /**
     * Mostra um quiz específico pelo ID.
     */
    public function show($id)
    {
        $quiz = Quiz::find($id);

        if (! $quiz) {
            return response()->json(['mensagem' => 'Quiz não encontrado'], 404);
        }

        return response()->json($this->format(collect([$quiz]))->first());
    }

    /**
     * Formata a coleção de quizzes para o payload da API.
     *
     * @param \Illuminate\Support\Collection $quizzes
     * @return \Illuminate\Support\Collection
     */
    private function format($quizzes)
    {
        return $quizzes->map(function($quiz) {
            return [
                'id'             => $quiz->id,
                'pergunta'       => $quiz->pergunta,
                'alternativas'   => [
                    'a' => $quiz->alternativa_a,
                    'b' => $quiz->alternativa_b,
                    'c' => $quiz->alternativa_c,
                    'd' => $quiz->alternativa_d,
                ],
                'respostaCorreta'=> strtolower($quiz->resposta_correta), // 'a'|'b'|'c'|'d'
            ];
        });
    }
}
