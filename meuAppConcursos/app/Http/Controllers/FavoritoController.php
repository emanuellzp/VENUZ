<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorito;
use Illuminate\Support\Facades\Auth;

class FavoritoController extends Controller
{
    public function storeQuiz($quizId)
    {
        $favorito = Favorito::firstOrCreate([
            'user_id' => Auth::id(),
            'quiz_id' => $quizId,
        ]);
        return response()->json($favorito, 201);
    }

    public function destroyQuiz($quizId)
    {
        $deleted = Favorito::where('user_id', Auth::id())
                           ->where('quiz_id', $quizId)
                           ->delete();
        if ($deleted) {
            return response()->json(['message' => 'Quiz desfavoritado com sucesso'], 200);
        }
        return response()->json(['message' => 'Favorito não encontrado'], 404);
    }

    public function userFavoriteQuizzes()
    {
        $favorites = Favorito::with('quiz')
                      ->where('user_id', Auth::id())
                      ->get()
                      ->map(fn($f) => $f->quiz);
        return response()->json($favorites);
    }
}
