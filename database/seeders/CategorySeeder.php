<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Income
            ['name' => 'Salary',         'color' => '#198754', 'type' => 'income',  'icon' => 'bi-briefcase'],
            ['name' => 'Freelance',       'color' => '#0dcaf0', 'type' => 'income',  'icon' => 'bi-laptop'],
            ['name' => 'Investment',      'color' => '#6f42c1', 'type' => 'income',  'icon' => 'bi-graph-up'],
            ['name' => 'Gift',            'color' => '#fd7e14', 'type' => 'income',  'icon' => 'bi-gift'],
            // Expense
            ['name' => 'Rent / Mortgage', 'color' => '#dc3545', 'type' => 'expense', 'icon' => 'bi-house'],
            ['name' => 'Groceries',       'color' => '#d63384', 'type' => 'expense', 'icon' => 'bi-cart'],
            ['name' => 'Utilities',       'color' => '#ffc107', 'type' => 'expense', 'icon' => 'bi-lightning'],
            ['name' => 'Transport',       'color' => '#0d6efd', 'type' => 'expense', 'icon' => 'bi-car-front'],
            ['name' => 'Healthcare',      'color' => '#20c997', 'type' => 'expense', 'icon' => 'bi-heart-pulse'],
            ['name' => 'Entertainment',   'color' => '#6610f2', 'type' => 'expense', 'icon' => 'bi-film'],
            ['name' => 'Clothing',        'color' => '#e83e8c', 'type' => 'expense', 'icon' => 'bi-bag'],
            ['name' => 'Education',       'color' => '#0dcaf0', 'type' => 'expense', 'icon' => 'bi-book'],
            ['name' => 'Subscriptions',   'color' => '#fd7e14', 'type' => 'expense', 'icon' => 'bi-credit-card'],
            ['name' => 'Dining Out',      'color' => '#dc3545', 'type' => 'expense', 'icon' => 'bi-cup-hot'],
            // Both
            ['name' => 'Other',           'color' => '#6c757d', 'type' => 'both',    'icon' => 'bi-three-dots'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['name' => $cat['name'], 'is_predefined' => true],
                array_merge($cat, ['is_predefined' => true, 'user_id' => null])
            );
        }
    }
}
