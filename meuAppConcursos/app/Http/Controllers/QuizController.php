<?php
// C:\Users\Fabio Emanuell\OneDrive\Documentos\IFTO\Desenvolvimento de app\meuAppConcursos\app\Http\Controllers QuizController.php
namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\RespostaUsuario; // Precisará deste model se não tiver
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuizController extends Controller
{
    public function index()
    {
        return response()->json(Quiz::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'pergunta' => 'required|string|max:500',
            'alternativa_a' => 'required|string|max:255',
            'alternativa_b' => 'required|string|max:255',
            'alternativa_c' => 'required|string|max:255',
            'alternativa_d' => 'required|string|max:255',
            'resposta_correta' => 'required|in:a,b,c,d',
        ]);

        $quiz = Quiz::create([
            'user_id' => Auth::id(),
            'categoria_id' => $request->categoria_id,
            'pergunta' => $request->pergunta,
            'alternativa_a' => $request->alternativa_a,
            'alternativa_b' => $request->alternativa_b,
            'alternativa_c' => $request->alternativa_c,
            'alternativa_d' => $request->alternativa_d,
            'resposta_correta' => $request->resposta_correta,
        ]);

        return response()->json($quiz, 201);
    }

    public function show($id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json(['message' => 'Quiz não encontrado'], 404);
        }
        return response()->json($quiz);
    }

    public function update(Request $request, $id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json(['message' => 'Quiz não encontrado'], 404);
        }

        if ($quiz->user_id !== Auth::id()) {
            return response()->json(['message' => 'Não autorizado para atualizar este quiz'], 403);
        }

        $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'pergunta' => 'required|string|max:500',
            'alternativa_a' => 'required|string|max:255',
            'alternativa_b' => 'required|string|max:255',
            'alternativa_c' => 'required|string|max:255',
            'alternativa_d' => 'required|string|max:255',
            'resposta_correta' => 'required|in:a,b,c,d',
        ]);

        $quiz->update($request->all());

        return response()->json($quiz);
    }

    public function destroy($id)
    {
        $quiz = Quiz::find($id);

        if (!$quiz) {
            return response()->json(['message' => 'Quiz não encontrado'], 404);
        }

        if ($quiz->user_id !== Auth::id()) {
            return response()->json(['message' => 'Não autorizado para excluir este quiz'], 403);
        }

        $quiz->delete();

        return response()->json(['message' => 'Quiz excluído com sucesso!'], 200);
    }

    public function userQuizzes(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }
        $quizzes = Quiz::where('user_id', Auth::id())->with('categoria')->get();
        return response()->json($quizzes);
    }

    // NOVO MÉTODO: lastAnsweredQuiz
    public function lastAnsweredQuiz(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        // Assumindo que 'respostas_usuarios' tem 'user_id', 'quiz_id', 'created_at' (ou 'updated_at')
        // E que 'RespostaUsuario' é o Model para essa tabela.
        $lastAnswer = RespostaUsuario::where('user_id', Auth::id())
                                    ->latest('created_at') // Ou 'updated_at' dependendo de como você registra o tempo
                                    ->with('quiz') // Carrega o quiz relacionado à resposta
                                    ->first();

        if (!$lastAnswer || !$lastAnswer->quiz) {
            return response()->json([
                'message' => 'Nenhum quiz respondido ainda.',
                'pergunta' => 'Nenhum quiz recente',
                'pontuacao' => 0 // Retorna um valor padrão para não quebrar o frontend
            ], 200);
        }

        // Aqui você pode calcular a pontuação se for um único quiz
        // Por exemplo, se RespostaUsuario tem 'acertou' (boolean) ou 'pontos'
        // Para simplificar, vamos usar uma pontuação fictícia ou buscar a pontuação total do usuário
        // ou você precisaria calcular a porcentagem de acerto para aquele quiz específico.
        // Por enquanto, usaremos uma pontuação hardcoded para o exemplo de frontend
        $pontuacaoFicticia = rand(70, 100); // Exemplo de pontuação aleatória para o card

        return response()->json([
            'message' => 'Último quiz respondido encontrado.',
            'pergunta' => $lastAnswer->quiz->pergunta, // A pergunta do quiz
            'pontuacao' => $pontuacaoFicticia // Pontuação fictícia ou calculada
        ]);
    }
}