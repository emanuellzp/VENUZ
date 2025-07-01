<?php
// C:\Users\Fabio Emanuell\OneDrive\Documentos\IFTO\Desenvolvimento de app\meuAppConcursos\app\Http\Controllers - ConteudoController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conteudo; // Certifique-se de que o namespace para Conteudo está correto
use App\Models\Categoria; // Embora não usado diretamente aqui, é bom ter se Categoria for referenciada em outros lugares do controller

class ConteudoController extends Controller
{
    /**
     * Retorna todos os conteúdos com suas categorias.
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // CORREÇÃO: Usa eager loading para carregar a categoria relacionada a cada conteúdo
        $conteudos = Conteudo::with('categoria')->get();
        return response()->json($conteudos);
    }

    /**
     * Armazena um novo conteúdo no banco de dados.
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validação dos dados de entrada
        $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'required|string',
            'link' => 'nullable|url|max:255', // Link pode ser nulo e deve ser uma URL válida
            'categoria_id' => 'required|exists:categorias,id', // Deve existir na tabela categorias
        ]);

        $conteudo = new Conteudo();
        $conteudo->titulo = $request->titulo;
        $conteudo->descricao = $request->descricao;
        $conteudo->link = $request->link;
        $conteudo->categoria_id = $request->categoria_id;
        $conteudo->save();

        // Opcional: Retornar o conteúdo com a categoria carregada após a criação
        // $conteudo->load('categoria'); 
        return response()->json($conteudo, 201); // 201 Created
    }

    /**
     * Exibe um conteúdo específico com sua categoria.
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        // CORREÇÃO: Usa eager loading para carregar a categoria relacionada ao conteúdo específico
        $conteudo = Conteudo::with('categoria')->find($id);

        if ($conteudo) {
            return response()->json($conteudo);
        }

        return response()->json(['message' => 'Registro não encontrado'], 404); // 404 Not Found
    }

    /**
     * Atualiza um conteúdo existente no banco de dados.
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // Validação dos dados de entrada
        $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'required|string',
            'link' => 'nullable|url|max:255',
            'categoria_id' => 'required|exists:categorias,id',
        ]);

        $conteudo = Conteudo::find($id);

        if ($conteudo) {
            $conteudo->titulo = $request->titulo;
            $conteudo->descricao = $request->descricao;
            $conteudo->link = $request->link;
            $conteudo->categoria_id = $request->categoria_id;
            $conteudo->save();

            // Opcional: Recarrega o conteúdo com a categoria atualizada para a resposta
            // $conteudo->load('categoria');
            return response()->json($conteudo);
        }

        return response()->json(['message' => 'Registro não encontrado'], 404); // 404 Not Found
    }

    /**
     * Remove um conteúdo do banco de dados.
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $conteudo = Conteudo::find($id);

        if ($conteudo) {
            $conteudo->delete();
            return response()->json(['message' => 'Registro excluído com sucesso!'], 200); // 200 OK
        }

        return response()->json(['message' => 'Registro não encontrado'], 404); // 404 Not Found
    }
}
