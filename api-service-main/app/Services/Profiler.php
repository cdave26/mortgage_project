<?php

namespace App\Services;

/**
 * Trait Profiler
 *
 * Provides a simple profiling mechanism to measure the execution time of code blocks.
 */
trait Profiler
{
    /**
     * An associative array to store profiling information.
     *
     * @var array
     */
    private $profiles = [];

    /**
     * Starts a new profiling session for the given key.
     *
     * @param string $key The identifier for the profiling session.
     *
     * @return void
     */
    private function start(string $key): void
    {
        $this->profiles[$key] = [
            'start' => microtime(true),
        ];
    }

    /**
     * Stops the profiling session for the given key, calculates the time difference, and logs the result.
     *
     * @param string $key The identifier for the profiling session.
     *
     * @return void
     */
    private function stop(string $key): void
    {
        if (array_key_exists($key, $this->profiles)) {
            $end = microtime(true);
            $diffInMilliseconds = ($end - $this->profiles[$key]['start']) * 1000;

            $this->profiles[$key] += [
                'end' => $end,
                'diff' => $diffInMilliseconds
            ];

            \Log::info(sprintf('%s took %s ms', $key, $this->profiles[$key]['diff']));
        }
    }
}