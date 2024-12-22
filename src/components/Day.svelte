<script lang="ts">
  import { isSameDay } from "date-fns";
  let { day, selected, onMouseDown, onMouseUp, onMouseOver } = $props();
  const today = new Date();

  function mouseDown() {
    if (!day.date) return;
    onMouseDown(day.date);
  }

  function mouseOver() {
    if (!day.date) return;
    onMouseOver(day.date);
  }

  function mouseUp() {
    if (!day.date) return;
    onMouseUp(day.date);
  }
</script>

<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<td
  onmousedown={() => mouseDown()}
  onmouseover={() => mouseOver()}
  onmouseup={() => mouseUp()}
  class={` calTable h-32 w-36 max-h-36 overflow-scroll ${
    isSameDay(day.date, today)
      ? "bg-blue-500 text-white"
      : selected
        ? "bg-blue-100 shadow-xl"
        : "bg-gray-100"
  }`}
>
  {#if day.date}
    <span class="p-2">
      {day.date.getDate()}
    </span>

    <slot></slot>
  {/if}
</td>
