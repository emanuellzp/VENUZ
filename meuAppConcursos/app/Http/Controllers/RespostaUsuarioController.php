<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RespostaUsuario;

class RespostaUsuarioController extends Controller
{
    public function index()
    {
        return RespostaUsuario::all();
    }

    public function store(Request $request)
    {
        $resposta = RespostaUsuario::create([
            'usuario_id' => $request->usuario_id,
            'quiz_id' => $request->quiz_id,
            'resposta_dada' => $request->resposta_dada,
            'acertou' => $request->acertou
        ]);

        return response()->json($resposta, 201);
    }

    public function show($id)
    {
        $resposta = RespostaUsuario::find($id);

        if ($resposta) {
            return $resposta;
        }

        return response()->json(['mensagem' => 'Registro não encontrado'], 404);
    }

    public function update(Request $request, $id)
    {
        $resposta = RespostaUsuario::find($id);

        if ($resposta) {
            $resposta->update($request->all());
            return $resposta;
        }

        return response()->json(['mensagem' => 'Registro não encontrado'], 404);
    }

    public function destroy($id)
    {
        $resposta = RespostaUsuario::find($id);

        if ($resposta) {
            $resposta->delete();
            return response()->json(['mensagem' => 'Registro excluído com sucesso!']);
        }

        return response()->json(['mensagem' => 'Registro não encontrado'], 404);
    }
}
