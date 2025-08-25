@props(['name', 'options' => [], 'selected' => []])

<div>
    @foreach ($options as $value => $label)
        <label class="dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm">
            <input type="checkbox" name="{{ $name }}" value="{{ $value }}" {{ in_array($value, $selected) ? 'checked' : '' }} class="rounded border-gray-300 text-indigo-200 shadow-sm focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-500 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 dark:text-gray-200">
            <span class="ml-2">{{ $label }}</span>
        </label>
    @endforeach
</div>
