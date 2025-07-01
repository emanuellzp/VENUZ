<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ranking;

class RankingController extends Controller
{
    public function index()
    {
        return Ranking::orderBy('pontuacao', 'desc')->get(); // lista em ordem decrescente de pontuação
    }

    public function store(Request $request)
    {
        $ranking = Ranking::create([
            'usuario_id' => $request->usuario_id,
            'pontuacao' => $request->pontuacao,
            'ultima_atualizacao' => now()
        ]);

        return response()->json($ranking, 201);
    }

    public function show($id)
    {
        $ranking = Ranking::find($id);

        if ($ranking) {
            return $ranking;
        }

        return response()->json(['mensagem' => 'Registro não encontrado'], 404);
    }

    public function update(Request $request, $id)
    {
        $ranking = Ranking::find($id);

        if ($ranking) {
            $ranking->update([
                'pontuacao' => $request->pontuacao,
                'ultima_atualizacao' => now()
            ]);

            return $ranking;
        }

        return response()->json(['mensagem' => 'Registro não encontrado'], 404);
    }

    public function destroy($id)
    {
        $ranking = Ranking::find($id);

        if ($ranking) {
            $ranking->delete();
            return response()->json(['mensagem' => 'Registro excluído com sucesso!']);
        }

        return response()->json(['mensagem' => 'Registro não encontrado'], 404);
    }
}
