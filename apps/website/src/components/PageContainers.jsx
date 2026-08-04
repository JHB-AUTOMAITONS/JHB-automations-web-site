// The container renderer now lives in @jhb/shared so the website and every
// admin editor preview render containers with identical logic. This thin
// re-export keeps existing `import PageContainers from "@/components/PageContainers"`
// call sites working unchanged.
export { PageContainersView as default } from "@jhb/shared/container-view";
