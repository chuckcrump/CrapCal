<script>
    //@ts-nocheck
    import calendarize from "calendarize";
    import {
        format,
        addMonths,
        getDate,
        getMonth,
        getYear,
        isSameDay,
        isWithinInterval,
    } from "date-fns";
    import Day from "./components/Day.svelte";
    import Icon from "./components/DelIcon.svelte";
    import { writable } from "svelte/store";
    import { persisted } from "svelte-persisted-store";
    import * as devalue from "devalue";

    let selectedDays = {};
    let eventName = "";
    let showEventPopup = false;
    let date = new Date();
    let selectedDate;
    let today = new Date();

    //multi day events
    let dragging = false;
    let startDate = undefined;
    let endDate = undefined;

    $: view = calendarize(date).map((week) =>
        week.map((day) => {
            return {
                date:
                    day === 0
                        ? undefined
                        : new Date(date.getFullYear(), date.getMonth(), day),
            };
        }),
    );

    const events = persisted("events", [], { serializer: devalue });

    $: sortedEvents = $events.sort((a, b) => {
        const startComparison = a.start.getTime() - b.start.getTime();
        if (startComparison !== 0) {
            return startComparison;
        }
        const durationA = a.end.getTime() - a.start.getTime();
        const durationB = b.end.getTime() - b.start.getTime();
        return durationB - durationA;
    });

    function addMonth() {
        date = addMonths(date, 1);
    }

    function backMonth() {
        date = addMonths(date, -1);
    }

    function addEvent(start, end) {
        if (eventName === "") {
            return;
        }
        const newEvent = {
            name: eventName,
            start: start,
            end: end,
            id: Math.round(Math.random() * 10000),
        };
        console.log(newEvent.id);
        eventName = "";
        showEventPopup = false;
        events.update((events) => [...events, newEvent]);
        selectedDate = undefined;
    }

    function deleteEvent(id) {
        events.update((items) => items.filter((item) => item.id !== id));
        console.log(id);
    }
</script>

<div
    class="fixed top-0 left-0 h-screen w-56 m-0 flex flex-col bg-gray-100 text-white shadow-lg"
>
    <table>
        <thead>
            <tr class="text-black">
                <th>S</th>
                <th>M</th>
                <th>T</th>
                <th>W</th>
                <th>T</th>
                <th>F</th>
                <th>S</th>
            </tr>
        </thead>
        <tbody>
            {#each view as week}
                <tr>
                    {#each week as day}
                        <td>
                            {#if day.date}
                                <span
                                    class={` text-black p-1 ${
                                        isSameDay(day.date, today)
                                            ? "bg-blue-500 text-white rounded-full p-[2px]"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    {day.date.getDate()}
                                </span>
                            {/if}
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<div class="ml-56">
    {#if showEventPopup}
        <div class=" fixed inset-0 flex items-center justify-center z-10">
            <div
                class="bg-white backdrop-blur-md rounded-lg p-2 w-96 shadow-lg"
            >
                {#if startDate === endDate}
                    <h3 class="text-xl font-semibold p-2">
                        Adding event for {format(startDate, "EEEE 'the' do")}
                    </h3>
                {:else}
                    <h3 class="text-xl font-semibold p-2">
                        Adding event from {format(startDate, "EEEE 'the' do")} to
                        {format(endDate, "EEEE 'the' do")}
                    </h3>
                {/if}

                <input
                    type="text"
                    bind:value={eventName}
                    placeholder="New event..."
                    class=" bg-gray-100 w-full p-2 rounded-md text-xl"
                />

                <div class=" flex justify-end space-x-2 p-2">
                    <button
                        onclick={() => {
                            showEventPopup = false;
                            startDate = undefined;
                            endDate = undefined;
                        }}
                        class="btn bg-red-500 hover:bg-red-600">Cancel</button
                    >

                    <button
                        onclick={() => {
                            addEvent(startDate, endDate);
                            startDate = undefined;
                            endDate = undefined;
                        }}
                        class="btn bg-blue-500 hover:bg-blue-600">Add</button
                    >
                </div>
            </div>
        </div>
    {/if}

    <div class="items-center justify-center flex p-3">
        <h1 class="font-semibold text-3xl p-2">{format(date, "LLLL, yyyy")}</h1>
        <button onclick={backMonth} class="btn p-2 bg-red-500">Back</button>
        <button onclick={addMonth} class="btn p-2 bg-blue-500">Foward</button>
    </div>

    <div class="flex items-center justify-center">
        <table class="table-auto">
            <thead>
                <tr class="text-xl h-8">
                    <th>S</th>
                    <th>M</th>
                    <th>T</th>
                    <th>W</th>
                    <th>T</th>
                    <th>F</th>
                    <th>S</th>
                </tr>
            </thead>

            <tbody>
                {#each view as week}
                    <tr class="">
                        {#each week as day}
                            <Day
                                {day}
                                {date}
                                onMouseDown={(date) => {
                                    startDate = date;
                                    dragging = true;
                                }}
                                onMouseUp={(date) => {
                                    endDate = date;
                                    dragging = false;
                                    showEventPopup = true;
                                }}
                                onMouseOver={(date) => {
                                    if (dragging) {
                                        endDate = date;
                                    }
                                }}
                                selected={day.date &&
                                    isWithinInterval(day.date, {
                                        start: startDate,
                                        end: endDate,
                                    })}
                            >
                                {#each sortedEvents as event, index}
                                    {#if isWithinInterval( day.date, { start: event.start, end: event.end }, )}
                                        <div
                                            class="flex justify-between items-center bg-blue-100 hover:bg-blue-200 transition-colors hover my-1"
                                            class:rounded-l-lg={isSameDay(
                                                day.date,
                                                event.start,
                                            )}
                                            class:ml-2={isSameDay(
                                                day.date,
                                                event.start,
                                            )}
                                            class:rounded-r-lg={isSameDay(
                                                day.date,
                                                event.end,
                                            )}
                                            class:mr-2={isSameDay(
                                                day.date,
                                                event.end,
                                            )}
                                        >
                                            {#if isSameDay(day.date, event.start)}
                                                <p class="p-1">{event.name}</p>
                                            {:else}
                                                <p class="p-1">&nbsp;</p>
                                            {/if}

                                            {#if isSameDay(day.date, event.end)}
                                                <button
                                                    class="flex text-xl p-1 bg-none hover:bg-red-500 rounded-lg items-center justify-center w-8 text-black hover:text-white transition-colors"
                                                    onmousedown={(event) =>
                                                        event.stopPropagation()}
                                                    onmouseup={(event) =>
                                                        event.stopPropagation()}
                                                    onclick={(e) => {
                                                        e.stopPropagation();
                                                        deleteEvent(event.id);
                                                    }}
                                                >
                                                    <Icon size={20}></Icon>
                                                </button>
                                            {/if}
                                        </div>
                                    {/if}
                                {/each}
                            </Day>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    @import "./app.css";
</style>
