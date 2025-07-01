<?php
// C:\Users\Fabio Emanuell\OneDrive\Documentos\IFTO\Desenvolvimento de app\meuAppConcursos\app\Http\Controllers  - CategoriaController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;

class CategoriaController extends Controller
{
    public function index(){

        $categorias = Categoria::all();

        return $categorias;

    }

    public function store(Request $request){

        $categoria = new Categoria();
        $categoria->nome = $request->nome;
        $categoria->icone = $request->icone;
        $categoria->save();

        return $categoria;
    }

    public function show(Request $request,$id){

        $categoria = Categoria::find($id);

        if($categoria){
            return $categoria;
        }

        return response()->json(['Mensagem' => "Registro não encontrado"]); 
    }

    public function update(Request $request,$id){
        
        $categoria = Categoria::find($id);

        if($categoria){
            
            $categoria->nome = $request->nome;
            $categoria->icone = $request->icone;
            $categoria->save();
            return $categoria;
        }

        return response()->json(['Mensagem' => "Registro não encontrado"]);
    }

    public function destroy(Request $request,$id){
        
        $categoria = Categoria::find($id);

        if($categoria){
            
           $categoria->delete();
           return response()->json(['Mensagem' => "Registro excluído com sucesso!"]);
        }

        return response()->json(['Mensagem' => "Registro não encontrado"]);
    }

}
