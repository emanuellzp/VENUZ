<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StudyPlan;

class StudyPlanController extends Controller
{
    public function index(Request $request)
    {
        // retorna só os do usuário logado
        return response()->json($request->user()->studyPlans()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'disciplina' => 'required|string',
            'conteudo'   => 'required|string',
            'study_date' => 'required|date',
        ]);

        $plan = $request->user()->studyPlans()->create($data);
        return response()->json($plan, 201);
    }

    public function update(Request $request, $id)
    {
        $plan = $request->user()->studyPlans()->findOrFail($id);
        $data = $request->validate([
            'disciplina' => 'sometimes|required|string',
            'conteudo'   => 'sometimes|required|string',
            'study_date' => 'sometimes|required|date',
        ]);
        $plan->update($data);
        return response()->json($plan);
    }

    public function destroy(Request $request, $id)
    {
        $plan = $request->user()->studyPlans()->findOrFail($id);
        $plan->delete();
        return response()->json(null, 204);
    }
}
