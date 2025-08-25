@props(['disabled' => false, 'options' => [], 'selected' => [], 'name' => 'items'])

<div>
    @foreach ($options as $value => $label)
        <div>
            <input type="checkbox" name="{{ $name }}[]" value="{{ $value }}"
                   {{ in_array($value, $selected) ? 'checked' : '' }}
                   {{ $disabled ? 'disabled' : '' }}
                   class="rounded border-gray-300 text-indigo-200 shadow-sm focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-500 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 dark:text-gray-200">
            <label class="dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm">
                {{ $label }}
            </label>
        </div>
    @endforeach
</div>
