<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth; // Certifique-se de que esta linha está presente

class UserController extends Controller
{
    // REGISTRO
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:4', // Considerando que seu frontend valida min 4
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'pontuacao_total' => 0, // Adicione um valor inicial para pontuacao_total no registro
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'pontuacao_total']), // Retornar apenas os campos necessários
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    // LOGIN
    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Tenta encontrar o usuário pelo email
        $user = User::where('email', $fields['email'])->first();

        // Verifica se o usuário existe e se a senha está correta
        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json([ // Use response()->json para consistência
                'message' => 'Credenciais inválidas'
            ], 401); // Retorna 401 Unauthorized
        }

        // Revoga tokens existentes (opcional, mas boa prática para segurança)
        // $user->tokens()->delete();

        // Cria um novo token para o usuário
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login bem-sucedido', // Adicionado para consistência com o register
            'access_token' => $token,
            'token_type' => 'Bearer',
            // CORREÇÃO AQUI: Incluir os dados do usuário na resposta de login
            'user' => $user->only(['id', 'name', 'email', 'pontuacao_total']),
        ], 200); // 200 OK para login bem-sucedido
    }

    // PERFIL AUTENTICADO
    public function me(Request $request)
    {
        // Garante que apenas os campos necessários são retornados
        return response()->json($request->user()->only(['id', 'name', 'email', 'pontuacao_total']));
    }

    // RANKING
    public function ranking()
    {
        // Removido orderBy do Eloquent para evitar possível erro de índice em produção (conforme instrução)
        // Buscamos todos e ordenamos no PHP, ou você pode adicionar um índice no DB para 'pontuacao_total'
        $ranking = User::select('name', 'pontuacao_total')->get();

        // Ordena a coleção em memória
        $ranking = $ranking->sortByDesc('pontuacao_total')->values(); // .values() para reindexar o array

        return response()->json($ranking);
    }
}