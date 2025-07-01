<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ConteudoController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\QuizPlayController;
use App\Http\Controllers\RespostaUsuarioController;
use App\Http\Controllers\FavoritoController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\StudyPlanController;

// Rotas Públicas
Route::post('/register', [UserController::class, 'register']);
Route::post('/login',    [UserController::class, 'login']);

// Rotas Protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Usuário & Perfil
    Route::get('/me',              [UserController::class, 'me']);
    Route::post('/logout',         function(Request $req){ 
        $req->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'Logout successful']);
    });

    // Quizzes & ranking etc...
    Route::get('/me/quizzes',      [QuizController::class, 'userQuizzes']);
    Route::get('/me/quizzes/last', [QuizController::class, 'lastAnsweredQuiz']);
    Route::get('/ranking',         [UserController::class, 'ranking']);

    // CRUDs
    Route::apiResource('categorias', CategoriaController::class);
    Route::apiResource('conteudos', ConteudoController::class);
    Route::apiResource('quizzes',   QuizController::class);
    Route::get('/play/quizzes/random',           [QuizPlayController::class, 'getRandomQuiz']);
    Route::get('/play/quizzes/by-category/{id}',[QuizPlayController::class, 'getByCategory']);
    Route::apiResource('respostas_usuarios', RespostaUsuarioController::class);
    Route::post('/favoritar-quiz/{quizId}',    [FavoritoController::class, 'storeQuiz']);
    Route::delete('/desfavoritar-quiz/{quizId}',[FavoritoController::class, 'destroyQuiz']);
    Route::get('/me/favoritos/quizzes',         [FavoritoController::class, 'userFavoriteQuizzes']);
    Route::apiResource('ranking', RankingController::class)
         ->only(['index','store','show','update','destroy']);

    // **NOVO** CRUD de StudyPlans
    Route::apiResource('study-plans', StudyPlanController::class)
         ->except(['show']);
});
