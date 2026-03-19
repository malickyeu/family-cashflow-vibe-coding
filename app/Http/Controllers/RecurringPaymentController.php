<?php

namespace App\Http\Controllers;

use App\Http\Traits\ResolvesFamily;
use App\Models\RecurringPayment;
use App\Models\Category;
use App\Http\Requests\StoreRecurringPaymentRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RecurringPaymentController extends Controller
{
    use ResolvesFamily;

    public function index(): Response
    {
        $payments = $this->applyScope(RecurringPayment::with(['category', 'user']), 'user_id')
            ->orderBy('next_due_date')
            ->get();

        return Inertia::render('RecurringPayments/Index', [
            'payments' => $payments,
            'currency' => config('app.currency', 'PLN'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('RecurringPayments/Form', [
            'categories' => Category::forContext($this->currentFamilyId(), auth()->id())->orderBy('name')->get(),
            'currency'   => config('app.currency', 'PLN'),
        ]);
    }

    public function store(StoreRecurringPaymentRequest $request): RedirectResponse
    {
        RecurringPayment::create([
            ...$request->validated(),
            'user_id'   => auth()->id(),
            'family_id' => $this->currentFamilyId(),
        ]);

        return redirect()->route('recurring.index')
            ->with('success', 'Recurring payment created.');
    }

    public function edit(RecurringPayment $recurring): Response
    {
        return Inertia::render('RecurringPayments/Form', [
            'payment'    => $recurring,
            'categories' => Category::forContext($this->currentFamilyId(), auth()->id())->orderBy('name')->get(),
            'currency'   => config('app.currency', 'PLN'),
        ]);
    }

    public function update(StoreRecurringPaymentRequest $request, RecurringPayment $recurring): RedirectResponse
    {
        $recurring->update($request->validated());

        return redirect()->route('recurring.index')
            ->with('success', 'Recurring payment updated.');
    }

    public function destroy(RecurringPayment $recurring): RedirectResponse
    {
        $recurring->delete();

        return redirect()->route('recurring.index')
            ->with('success', 'Recurring payment deleted.');
    }
}
