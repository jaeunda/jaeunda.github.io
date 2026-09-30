// Every external link on the site. Source excerpts point at a fixed commit so
// the quoted lines cannot drift from what the page shows.
const ONGI = "https://github.com/Ongi-Team/ongi-device"
const ONGI_AT = `${ONGI}/blob/473d7a9fbcff349d8b8e000978a5d65d8893bb0e`
const WG = "https://github.com/weavegate/weavegate"
const WG_AT = `${WG}/blob/44a5648870a6dd73f3f8769f6369b124b5bda721`

export const LINKS = {
  github: "https://github.com/jaeunda",
  email: "mailto:jaeunda@gmail.com",
  ongi: {
    repo: ONGI,
    motorTask: `${ONGI_AT}/components/motor/motor_task.c#L140-L162`,
    snapshot: `${ONGI_AT}/components/schedule/schedule_store.c#L148-L160`,
    pr23: `${ONGI}/pull/23`,
    pr38: `${ONGI}/pull/38`,
    pr57: `${ONGI}/pull/57`,
    pr60: `${ONGI}/pull/60`,
  },
  weavegate: {
    repo: WG,
    schedule: `${WG_AT}/fixtures/matching-slice/schedules/concurrent-assign.json`,
    config: `${WG_AT}/fixtures/matching-slice/.weavegate/config.yaml#L10-L36`,
    quickstart: `${WG_AT}/docs/quickstart.md`,
    determinism: `${WG_AT}/docs/experiments/determinism.md`,
    ciGate: `${WG_AT}/docs/howto/ci-gate.md`,
    javaSdk: `${WG_AT}/docs/reference/external-sut-java.md`,
    limitations: `${WG_AT}/docs/limitations.md`,
  },
  os: {
    repo: "https://github.com/jaeunda/operating-system",
    syscall: "https://github.com/jaeunda/os-p1-syscall",
    scheduler: "https://github.com/jaeunda/os-p2-scheduler",
    pageframe: "https://github.com/jaeunda/os-p3-pageframe",
    snapshot: "https://github.com/jaeunda/os-p4-snapshot",
  },
  lsp: {
    p1: "https://github.com/jaeunda/lsp-p1",
    p2: "https://github.com/jaeunda/lsp-p2",
    p3: "https://github.com/jaeunda/lsp-p3",
  },
} as const
