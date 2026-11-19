"use client";

import { Check, ImagePlus, X } from "lucide-react";
import * as m from "motion/react-m";
import { useActionState, useId, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { createChild, createMemory, createSong } from "@/app/actions";
import { BookCover } from "@/components/journal/book-cover";
import { Cassette } from "@/components/journal/mixtape";
import {
  MilestoneCard,
  NoteSlip,
  PrintFrame,
} from "@/components/journal/pieces";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ageLabel, cardDate, longDate } from "@/lib/age";
import { sheetForDate } from "@/lib/chapters";
import { parseSongUrl } from "@/lib/songs";
import {
  COVER_COLORS,
  type ActionState,
  type Child,
  type CoverColor,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ChildPicker,
  Field,
  FormError,
  FormFooter,
  FormLayout,
  inputClass,
  primaryButton,
  textareaClass,
} from "./fields";
import { MAX_FILES, useUploads, type UploadItem } from "./use-upload";

type Shared = {
  options: Child[];
  /** Chapter keys each journal already has, so previews use the right sheet colour. */
  chaptersByChild: Record<string, number[]>;
  childId: string;
  onChildChange: (id: string) => void;
  today: string;
};

const FIRSTS = [
  "First smile",
  "First laugh",
  "Rolled over",
  "First tooth",
  "First word",
  "First steps",
];

/** Runs a server action, and on success shows a toast and clears the form. */
function useEntryAction(
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>,
  onSaved: () => void,
) {
  return useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result?.ok) {
      toast.success(result.message);
      onSaved();
    }
    return result;
  }, null);
}

/** The sheet an entry with this date will be stuck on. */
function sheetFor(
  shared: Pick<Shared, "options" | "chaptersByChild" | "childId">,
  date: string,
  fallback: string,
) {
  const child = shared.options.find((c) => c.id === shared.childId);
  if (!child || !date) return fallback;
  return sheetForDate(
    child.birthDate,
    shared.chaptersByChild[child.id] ?? [],
    date,
  );
}

function ageFor(options: Child[], childId: string, date: string): string {
  const child = options.find((c) => c.id === childId);
  return child && date ? ageLabel(child.birthDate, date) : "";
}

// ------------------------------------------------------------ photo / video

/** A chosen file as a small square: the picture, or the first frame of the video. */
function Thumb({ item, className }: { item: UploadItem; className?: string }) {
  return item.kind === "video" ? (
    <video
      src={item.previewUrl}
      muted
      playsInline
      preload="metadata"
      className={className}
    />
  ) : (
    // A local blob preview; there is nothing for the image loader to optimise yet.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.previewUrl} alt="" className={className} />
  );
}

export function MediaForm({
  options,
  chaptersByChild,
  childId,
  onChildChange,
  today,
}: Shared) {
  const id = useId();
  const uploads = useUploads();
  const { items } = uploads;
  const [body, setBody] = useState("");
  const [date, setDate] = useState(today);
  const [songUrl, setSongUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [state, action, pending] = useEntryAction(createMemory, () => {
    setBody("");
    setSongUrl("");
    uploads.reset();
  });

  const active = items.find((item) => item.id === activeId) ?? items[0] ?? null;
  const single = items.length <= 1;
  const uploading = items.some((item) => item.upload.status === "uploading");
  const firstFailure = items.find((item) => item.upload.status === "error");
  const failed = firstFailure !== undefined;
  // Say why once, under the form, rather than on every file.
  const failure =
    firstFailure?.upload.status === "error"
      ? firstFailure.upload.message
      : null;
  const ready = items.flatMap((item) =>
    item.upload.status === "done"
      ? [{ ...item.upload.media, title: item.caption }]
      : [],
  );
  const songOk = songUrl.trim() === "" || parseSongUrl(songUrl) !== null;
  const room = MAX_FILES - items.length;

  function choose(files: FileList | null) {
    if (files && files.length > 0) void uploads.add([...files], items.length);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files);
  }

  return (
    <form action={action}>
      <input type="hidden" name="kind" value="media" />
      <input type="hidden" name="media" value={JSON.stringify(ready)} />
      <FormLayout
        sheet={sheetFor({ options, chaptersByChild, childId }, date, "sky")}
        preview={
          <div className="w-full max-w-xs">
            <PrintFrame caption={active?.caption ?? ""} className="-rotate-2">
              {active ? (
                active.kind === "video" ? (
                  <video
                    key={active.id}
                    src={active.previewUrl}
                    muted
                    playsInline
                    controls
                    className="block w-full"
                  />
                ) : (
                  <Thumb item={active} className="block w-full" />
                )
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-ink-soft">
                  <ImagePlus aria-hidden="true" className="size-8" />
                </div>
              )}
            </PrintFrame>
            {items.length > 1 && active ? (
              <p className="mt-4 text-center text-sm font-semibold text-ink">
                {items.indexOf(active) + 1} of {items.length}. Each one becomes
                its own print.
              </p>
            ) : null}
          </div>
        }
      >
        <ChildPicker
          options={options}
          value={childId}
          onChange={onChildChange}
        />

        <div className="grid gap-3">
          <span
            id={`${id}-file-label`}
            className="text-sm font-semibold text-ink"
          >
            Photos or videos
          </span>

          {items.length > 0 ? (
            <ul className="grid gap-3">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border-2 p-2.5 transition-colors duration-150",
                    item.id === active?.id ? "border-ink" : "border-border",
                  )}
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Thumb item={item} className="size-full object-cover" />
                    {item.upload.status === "uploading" ? (
                      <span className="absolute inset-x-1.5 bottom-1.5 block h-1.5 overflow-hidden rounded-full bg-paper/70">
                        <m.span
                          className="block h-full origin-left rounded-full bg-cobalt"
                          animate={{
                            scaleX: Math.max(item.upload.progress, 0.04),
                          }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        />
                      </span>
                    ) : null}
                    {item.upload.status === "done" ? (
                      <span className="absolute bottom-1 right-1 inline-flex size-6 items-center justify-center rounded-full bg-leaf text-paper">
                        <Check
                          aria-hidden="true"
                          className="size-3.5"
                          strokeWidth={3.5}
                        />
                      </span>
                    ) : null}
                  </div>

                  <div className="grid min-w-0 flex-1 gap-1.5">
                    <label
                      htmlFor={`${id}-caption-${item.id}`}
                      className="text-sm font-semibold text-ink"
                    >
                      Caption{items.length > 1 ? ` ${index + 1}` : ""}
                    </label>
                    <Input
                      id={`${id}-caption-${item.id}`}
                      value={item.caption}
                      onChange={(e) =>
                        uploads.setCaption(item.id, e.target.value)
                      }
                      onFocus={() => setActiveId(item.id)}
                      maxLength={80}
                      required
                      placeholder="Ten tiny toes"
                      className={inputClass}
                    />
                    <p
                      className={cn(
                        "text-sm",
                        item.upload.status === "error"
                          ? "font-medium text-destructive"
                          : "text-ink-soft",
                      )}
                      role={
                        item.upload.status === "error" ? "alert" : undefined
                      }
                      aria-live="polite"
                    >
                      {item.upload.status === "uploading"
                        ? `Uploading, ${Math.round(item.upload.progress * 100)}%`
                        : item.upload.status === "done"
                          ? "Uploaded"
                          : "Not uploaded"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => uploads.remove(item.id)}
                    aria-label={`Remove ${item.caption || item.name}`}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X
                      aria-hidden="true"
                      className="size-5"
                      strokeWidth={2.5}
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {room > 0 ? (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed border-ink/50 px-4 text-center transition-colors duration-150 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-cobalt hover:border-ink hover:bg-accent",
                items.length > 0 ? "min-h-16 py-3" : "min-h-32 py-6",
                dragging && "border-cobalt bg-accent",
              )}
            >
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                aria-labelledby={`${id}-file-label`}
                className="sr-only"
                onChange={(e) => {
                  choose(e.target.files);
                  e.target.value = "";
                }}
              />
              {items.length === 0 ? (
                <>
                  <ImagePlus aria-hidden="true" className="size-6 text-ink" />
                  <span className="text-base font-semibold text-ink">
                    Choose from your phone or computer
                  </span>
                  <span className="text-sm text-ink-soft">
                    Up to {MAX_FILES} at once. Photos up to 20 MB, videos up to
                    100 MB.
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-2 text-base font-semibold text-ink">
                  <ImagePlus aria-hidden="true" className="size-5" />
                  Add more ({room} left)
                </span>
              )}
            </label>
          ) : (
            <p className="text-sm text-ink-soft">
              That&rsquo;s {MAX_FILES}, the most you can add in one go. Stick
              these in, then add the rest.
            </p>
          )}

          {uploads.notice ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {uploads.notice}
            </p>
          ) : null}
        </div>

        <Field
          id={`${id}-date`}
          label={single ? "When it happened" : "When they happened"}
          hint={
            single
              ? ageFor(options, childId, date)
              : `${ageFor(options, childId, date)}. All ${items.length} share this date and land in the same chapter.`
          }
        >
          <Input
            id={`${id}-date`}
            name="happenedOn"
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            required
            className={cn(inputClass, "max-w-56")}
          />
        </Field>

        {single ? (
          <>
            <Field id={`${id}-body`} label="The story (optional)">
              <Textarea
                id={`${id}-body`}
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={600}
                placeholder="What was happening, who was there, what you want to remember."
                className={textareaClass}
              />
            </Field>

            <Field
              id={`${id}-song`}
              label="A song for this memory (optional)"
              hint={
                songOk
                  ? "Paste a YouTube or Spotify link."
                  : "That isn't a YouTube or Spotify link yet."
              }
            >
              <Input
                id={`${id}-song`}
                name="songUrl"
                type="url"
                inputMode="url"
                value={songUrl}
                onChange={(e) => setSongUrl(e.target.value)}
                aria-invalid={!songOk}
                placeholder="https://open.spotify.com/track/…"
                className={inputClass}
              />
            </Field>
          </>
        ) : (
          <p className="text-sm text-ink-soft">
            A story or a song belongs to a single memory. Add a photo on its own
            to give it one.
          </p>
        )}

        <FormFooter>
          <FormError message={state && !state.ok ? state.message : failure} />
          <div>
            <button
              type="submit"
              disabled={pending || uploading || failed || items.length === 0}
              className={primaryButton}
            >
              {pending
                ? "Sticking in…"
                : uploading
                  ? "Waiting for uploads…"
                  : items.length > 1
                    ? `Stick ${items.length} in the journal`
                    : "Stick it in the journal"}
            </button>
          </div>
        </FormFooter>
      </FormLayout>
    </form>
  );
}

// ---------------------------------------------------------------- milestone

export function MilestoneForm({
  options,
  chaptersByChild,
  childId,
  onChildChange,
  today,
}: Shared) {
  const id = useId();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState(today);
  const [state, action, pending] = useEntryAction(createMemory, () => {
    setTitle("");
    setBody("");
  });

  return (
    <form action={action}>
      <input type="hidden" name="kind" value="milestone" />
      <FormLayout
        sheet={sheetFor({ options, chaptersByChild, childId }, date, "butter")}
        preview={
          <MilestoneCard
            title={title}
            date={date ? cardDate(date) : "Today"}
            age={ageFor(options, childId, date)}
            note={body}
            tone="cobalt"
            className="w-full max-w-60 rotate-3"
          />
        }
      >
        <ChildPicker
          options={options}
          value={childId}
          onChange={onChildChange}
        />

        <Field id={`${id}-title`} label="What happened for the first time?">
          <Input
            id={`${id}-title`}
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={40}
            required
            placeholder="First smile"
            className={inputClass}
          />
          <div className="flex flex-wrap gap-2">
            {FIRSTS.map((first) => (
              <button
                key={first}
                type="button"
                onClick={() => setTitle(first)}
                aria-pressed={title === first}
                className="min-h-10 rounded-full border border-ink/40 px-3.5 text-sm font-medium text-ink transition-colors duration-150 hover:bg-accent aria-pressed:border-ink aria-pressed:bg-butter"
              >
                {first}
              </button>
            ))}
          </div>
        </Field>

        <Field
          id={`${id}-date`}
          label="When"
          hint={ageFor(options, childId, date)}
        >
          <Input
            id={`${id}-date`}
            name="happenedOn"
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            required
            className={cn(inputClass, "max-w-56")}
          />
        </Field>

        <Field id={`${id}-body`} label="A line about it (optional)">
          <Input
            id={`${id}-body`}
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={90}
            placeholder="At the ceiling fan. We'll take it."
            className={inputClass}
          />
        </Field>

        <FormFooter>
          <FormError message={state && !state.ok ? state.message : null} />
          <div>
            <button type="submit" disabled={pending} className={primaryButton}>
              {pending ? "Adding…" : "Add this first"}
            </button>
          </div>
        </FormFooter>
      </FormLayout>
    </form>
  );
}

// --------------------------------------------------------------------- note

export function NoteForm({
  options,
  chaptersByChild,
  childId,
  onChildChange,
  today,
}: Shared) {
  const id = useId();
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState(today);
  const [state, action, pending] = useEntryAction(createMemory, () =>
    setBody(""),
  );

  return (
    <form action={action}>
      <input type="hidden" name="kind" value="note" />
      <input type="hidden" name="title" value="A note" />
      <FormLayout
        sheet={sheetFor({ options, chaptersByChild, childId }, date, "rose")}
        preview={
          <NoteSlip
            body={body}
            author={author || null}
            date={date ? longDate(date) : ""}
            className="w-full max-w-sm -rotate-1"
          />
        }
      >
        <ChildPicker
          options={options}
          value={childId}
          onChange={onChildChange}
        />

        <Field id={`${id}-body`} label="Your note" hint={`${body.length}/600`}>
          <Textarea
            id={`${id}-body`}
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={600}
            required
            placeholder="Something you want them to read when they're older."
            className={cn(textareaClass, "min-h-40")}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={`${id}-author`} label="Signed by (optional)">
            <Input
              id={`${id}-author`}
              name="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={40}
              placeholder="Mum"
              className={inputClass}
            />
          </Field>
          <Field id={`${id}-date`} label="Written on">
            <Input
              id={`${id}-date`}
              name="happenedOn"
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputClass}
            />
          </Field>
        </div>

        <FormFooter>
          <FormError message={state && !state.ok ? state.message : null} />
          <div>
            <button type="submit" disabled={pending} className={primaryButton}>
              {pending ? "Tucking it in…" : "Tuck it into the journal"}
            </button>
          </div>
        </FormFooter>
      </FormLayout>
    </form>
  );
}

// --------------------------------------------------------------------- song

export function SongForm({
  options,
  childId,
  onChildChange,
}: Omit<Shared, "today" | "chaptersByChild">) {
  const id = useId();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [state, action, pending] = useEntryAction(createSong, () => {
    setUrl("");
    setTitle("");
    setNote("");
  });

  const embed = url.trim() ? parseSongUrl(url) : null;
  const provider = embed?.provider === "spotify" ? "Spotify" : "YouTube";
  const recognised = embed
    ? `${provider} ${embed.kind === "playlist" ? "playlist" : "song"} recognised.`
    : null;

  return (
    <form action={action}>
      <FormLayout
        sheet="album"
        preview={
          <div className="w-full max-w-64 rotate-2">
            <Cassette
              title={title || "Song title"}
              provider={embed ? provider : "YouTube or Spotify"}
              tone="tomato"
            />
          </div>
        }
      >
        <ChildPicker
          options={options}
          value={childId}
          onChange={onChildChange}
          legend="Whose mixtape?"
        />

        <Field
          id={`${id}-url`}
          label="YouTube or Spotify link"
          hint={
            url.trim() === ""
              ? "A single song or a whole playlist. Use the Share button in either app and paste the link."
              : (recognised ?? "That isn't a YouTube or Spotify link yet.")
          }
        >
          <Input
            id={`${id}-url`}
            name="url"
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-invalid={url.trim() !== "" && !embed}
            required
            placeholder="https://www.youtube.com/watch?v=…"
            className={inputClass}
          />
        </Field>

        <Field
          id={`${id}-title`}
          label="Name on the tape (optional)"
          hint="Leave it empty to use the song's own title."
        >
          <Input
            id={`${id}-title`}
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Our 3am playlist"
            className={inputClass}
          />
        </Field>

        <Field id={`${id}-note`} label="Why this one? (optional)">
          <Input
            id={`${id}-note`}
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder="Playing in the car on the way home."
            className={inputClass}
          />
        </Field>

        <FormFooter>
          <FormError message={state && !state.ok ? state.message : null} />
          <div>
            <button type="submit" disabled={pending} className={primaryButton}>
              {pending ? "Recording…" : "Add to the mixtape"}
            </button>
          </div>
        </FormFooter>
      </FormLayout>
    </form>
  );
}

// -------------------------------------------------------------- new journal

const COLOR_NAMES: Record<CoverColor, string> = {
  tomato: "Tomato red",
  cobalt: "Cobalt blue",
  marigold: "Marigold",
  leaf: "Leaf green",
  plum: "Plum",
};

export function ChildForm({ today }: { today: string }) {
  const id = useId();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [coverColor, setCoverColor] = useState<CoverColor>("tomato");
  const [state, action, pending] = useEntryAction(createChild, () => {
    setName("");
    setBirthDate("");
  });

  const draft: Child = {
    id: "draft",
    slug: "draft",
    name: name || "Their name",
    birthDate: birthDate || today,
    coverColor,
    coverPhoto: null,
    memoryCount: 0,
  };

  return (
    <form action={action}>
      <FormLayout
        sheet="mint"
        preview={
          <div className="aspect-[3/4] w-full max-w-56 -rotate-2 overflow-hidden rounded-l-[4px] rounded-r-xl shadow-lifted">
            <BookCover child={draft} sizes="1px" />
          </div>
        }
      >
        <Field id={`${id}-name`} label="Their name">
          <Input
            id={`${id}-name`}
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            required
            autoComplete="off"
            placeholder="Zuri"
            className={inputClass}
          />
        </Field>

        <Field
          id={`${id}-birth`}
          label="Birthday"
          hint="Chapters are worked out from this. A due date is fine if they haven't arrived yet."
        >
          <Input
            id={`${id}-birth`}
            name="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className={cn(inputClass, "max-w-56")}
          />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">
            Cover cloth
          </legend>
          <div className="flex flex-wrap gap-3">
            {COVER_COLORS.map((color) => (
              <label key={color} data-cover={color} className="cursor-pointer">
                <input
                  type="radio"
                  name="coverColor"
                  value={color}
                  checked={coverColor === color}
                  onChange={() => setCoverColor(color)}
                  className="peer sr-only"
                />
                <span className="bookcloth block size-12 rounded-full ring-ink ring-offset-2 ring-offset-paper transition-transform duration-150 ease-out-expo hover:scale-110 peer-checked:ring-3 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-cobalt" />
                <span className="sr-only">{COLOR_NAMES[color]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <FormFooter>
          <FormError message={state && !state.ok ? state.message : null} />
          <div>
            <button type="submit" disabled={pending} className={primaryButton}>
              {pending ? "Binding the book…" : "Start this journal"}
            </button>
          </div>
        </FormFooter>
      </FormLayout>
    </form>
  );
}
