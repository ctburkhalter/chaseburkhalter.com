"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2, ChevronDown, ChevronRight, Clipboard, ExternalLink, FileCode2, Folder, FolderOpen, GitBranch, Layers3, Search, X } from "lucide-react"
import type { DbtProjectExplorerFile, DbtProjectExplorerNode, DbtProjectExplorerPayload } from "@/lib/weather/types"

type ExplorerInteraction = "pipeline_explorer_viewed" | "pipeline_file_inspected" | "pipeline_model_inspected" | "pipeline_repository_opened" | "pipeline_docs_opened"

const categoryLabels: Record<string, string> = {
  all: "All files",
  ingestion: "Ingestion",
  staging: "Staging",
  intermediate: "Intermediate",
  marts: "Marts",
  seeds: "Seeds",
  tests: "Tests",
  macros: "Macros",
  config: "Setup",
}

const layerOrder = ["source", "seed", "staging", "intermediate", "marts", "exposure"]

interface FileTreeDirectory {
  directories: Map<string, FileTreeDirectory>
  files: DbtProjectExplorerFile[]
}

function displayName(value: string) {
  return value.replaceAll("_", " ")
}

function buildStatusLabel(status: string | null) {
  if (status === "success" || status === "pass") return "Passed"
  if (!status) return "Not run"
  return status.replaceAll("_", " ")
}

function buildFileTree(files: DbtProjectExplorerFile[]): FileTreeDirectory {
  const root: FileTreeDirectory = { directories: new Map(), files: [] }
  for (const file of files) {
    const segments = file.path.split("/")
    let current = root
    for (const segment of segments.slice(0, -1)) {
      if (!current.directories.has(segment)) current.directories.set(segment, { directories: new Map(), files: [] })
      current = current.directories.get(segment)!
    }
    current.files.push(file)
  }
  return root
}

function directoryPaths(files: DbtProjectExplorerFile[]) {
  return new Set(files.flatMap((file) => {
    const segments = file.path.split("/").slice(0, -1)
    return segments.map((_, index) => segments.slice(0, index + 1).join("/"))
  }))
}

function CodeViewer({ file, copied, onCopy, onGithubOpen }: { file: DbtProjectExplorerFile; copied: boolean; onCopy: () => void; onGithubOpen: () => void }) {
  const lines = file.content.split("\n")
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-foreground">{file.path}</p>
          <p className="mt-1 text-xs text-muted-foreground">{file.language} · {lines.length} lines</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCopy} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary" aria-label="Copy source code" title="Copy source code">
            {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Clipboard className="h-4 w-4" />}
          </button>
          <a href={file.githubUrl} target="_blank" rel="noreferrer" onClick={onGithubOpen} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary">View on GitHub <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </div>
      <pre className="max-h-[30rem] overflow-auto bg-background/55 py-3 text-xs leading-6 text-muted-foreground"><code>{lines.map((line, index) => <span key={`${index}-${line}`} className="grid grid-cols-[3.25rem_minmax(0,1fr)] px-4"><span className="select-none pr-4 text-right text-muted-foreground/60">{index + 1}</span><span className="whitespace-pre-wrap break-words text-foreground/90">{line || " "}</span></span>)}</code></pre>
    </div>
  )
}

function LineageNode({ node, active, onSelect }: { node: DbtProjectExplorerNode; active?: boolean; onSelect: (node: DbtProjectExplorerNode) => void }) {
  return <button type="button" onClick={() => onSelect(node)} className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${active ? "border-primary bg-primary/10 text-foreground" : "border-border/70 bg-background/40 text-muted-foreground hover:border-primary/60 hover:text-foreground"}`}><span className="block truncate font-mono">{node.name}</span><span className="mt-1 block text-[11px] uppercase text-muted-foreground">{node.layer}</span></button>
}

function FileTree({ directory, path = "", expandedDirectories, selectedFilePath, onToggle, onSelect }: {
  directory: FileTreeDirectory
  path?: string
  expandedDirectories: Set<string>
  selectedFilePath: string | null
  onToggle: (path: string) => void
  onSelect: (file: DbtProjectExplorerFile) => void
}) {
  return <ul className={path ? "ml-3 border-l border-border/60 pl-2" : "space-y-0.5"}>
    {Array.from(directory.directories.entries()).sort(([left], [right]) => left.localeCompare(right)).map(([name, child]) => {
      const childPath = path ? `${path}/${name}` : name
      const expanded = expandedDirectories.has(childPath)
      return <li key={childPath}>
        <button type="button" onClick={() => onToggle(childPath)} className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground" aria-expanded={expanded}>
          {expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          {expanded ? <FolderOpen className="h-4 w-4 shrink-0 text-primary" /> : <Folder className="h-4 w-4 shrink-0 text-primary" />}
          <span className="truncate font-mono">{name}</span>
        </button>
        {expanded && <FileTree directory={child} path={childPath} expandedDirectories={expandedDirectories} selectedFilePath={selectedFilePath} onToggle={onToggle} onSelect={onSelect} />}
      </li>
    })}
    {[...directory.files].sort((left, right) => left.path.localeCompare(right.path)).map((file) => <li key={file.path}>
      <button type="button" onClick={() => onSelect(file)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${selectedFilePath === file.path ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-background/70 hover:text-foreground"}`}>
        <FileCode2 className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate font-mono" title={file.path}>{file.path.split("/").at(-1)}</span>
      </button>
    </li>)}
  </ul>
}

export function DbtProjectExplorer({ explorer, onInteraction }: {
  explorer: DbtProjectExplorerPayload | null
  onInteraction: (type: ExplorerInteraction, properties?: { pipeline_file_category?: string; pipeline_node_layer?: string }) => void
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const viewedRef = useRef(false)
  const [category, setCategory] = useState("all")
  const [query, setQuery] = useState("")
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expandedDirectories, setExpandedDirectories] = useState(() => new Set([".github", ".github/workflows", "ingestion", "models", "models/marts", "models/marts/tornado_events", "tests"]))

  const nodesById = useMemo(() => new Map(explorer?.nodes.map((node) => [node.id, node]) ?? []), [explorer])
  const filteredFiles = useMemo(() => (explorer?.files ?? []).filter((file) => {
    const matchesCategory = category === "all" || file.category === category
    const normalizedQuery = query.trim().toLowerCase()
    return matchesCategory && (!normalizedQuery || file.path.toLowerCase().includes(normalizedQuery) || file.content.toLowerCase().includes(normalizedQuery))
  }), [category, explorer, query])
  const selectedFile = useMemo(() => {
    const files = explorer?.files ?? []
    return files.find((file) => file.path === selectedFilePath) ?? files.find((file) => file.path === "models/marts/tornado_events/fct_tornado_events.sql") ?? files[0] ?? null
  }, [explorer, selectedFilePath])
  const selectedNode = selectedNodeId ? nodesById.get(selectedNodeId) ?? null : selectedFile?.relatedNodeIds.map((id) => nodesById.get(id)).find(Boolean) ?? null
  const availableCategories = useMemo(() => ["all", ...Array.from(new Set((explorer?.files ?? []).map((file) => file.category)))], [explorer])
  const fileTree = useMemo(() => buildFileTree(filteredFiles), [filteredFiles])
  const searchExpandedDirectories = useMemo(() => directoryPaths(filteredFiles), [filteredFiles])

  useEffect(() => {
    const element = sectionRef.current
    if (!element || !explorer) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || viewedRef.current) return
      viewedRef.current = true
      onInteraction("pipeline_explorer_viewed")
    }, { threshold: 0.3 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [explorer, onInteraction])

  if (!explorer) {
    return <section className="mt-10 rounded-lg border border-border/70 bg-muted/20 p-5" aria-labelledby="pipeline-explorer-title">
      <p className="section-kicker">dbt project explorer</p>
      <h2 id="pipeline-explorer-title" className="mt-2 text-2xl font-semibold">Pipeline artifact unavailable</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Tornado event data is available, but the matching dbt project artifact has not been published yet. The page intentionally does not substitute a stale code snapshot.</p>
    </section>
  }

  const selectFile = (file: DbtProjectExplorerFile) => {
    setSelectedFilePath(file.path)
    setSelectedNodeId(file.relatedNodeIds[0] ?? null)
    const directories = file.path.split("/").slice(0, -1)
    setExpandedDirectories((current) => new Set([...current, ...directories.map((_, index) => directories.slice(0, index + 1).join("/"))]))
    onInteraction("pipeline_file_inspected", { pipeline_file_category: file.category })
  }
  const toggleDirectory = (path: string) => setExpandedDirectories((current) => {
    const next = new Set(current)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    return next
  })
  const selectNode = (node: DbtProjectExplorerNode) => {
    setSelectedNodeId(node.id)
    setSelectedFilePath(node.path)
    onInteraction("pipeline_model_inspected", { pipeline_node_layer: node.layer })
  }
  const copySource = async () => {
    if (!selectedFile) return
    try {
      await navigator.clipboard.writeText(selectedFile.content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }
  const upstream = (selectedNode?.upstream ?? []).map((id) => nodesById.get(id)).filter((node): node is DbtProjectExplorerNode => Boolean(node))
  const downstream = (selectedNode?.downstream ?? []).map((id) => nodesById.get(id)).filter((node): node is DbtProjectExplorerNode => Boolean(node))
  const modelLayers = layerOrder.filter((layer) => explorer.nodes.some((node) => node.layer === layer))

  return <section ref={sectionRef} className="engine-panel mt-10 overflow-hidden rounded-lg" aria-labelledby="pipeline-explorer-title">
    <div className="border-b border-border/70 px-5 py-6 md:px-7">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <p className="section-kicker">dbt project explorer</p>
          <h2 id="pipeline-explorer-title" className="mt-2 text-3xl font-bold tracking-tight">See the data product behind the event explorer</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">This is a versioned view of the project files, dbt graph, and test results from the exact pipeline run that produced the weather artifact.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={explorer.project.repositoryUrl} target="_blank" rel="noreferrer" onClick={() => onInteraction("pipeline_repository_opened")} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary">Repository <ExternalLink className="h-4 w-4" /></a>
          <a href={explorer.project.docsUrl ?? explorer.project.repositoryUrl} target="_blank" rel="noreferrer" onClick={() => onInteraction("pipeline_docs_opened")} className="inline-flex items-center gap-1.5 rounded-md border border-primary/50 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground">dbt docs <ExternalLink className="h-4 w-4" /></a>
        </div>
      </div>
      <div className="mt-6 grid divide-y divide-border/70 border-y border-border/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <div className="py-3 sm:px-4 sm:first:pl-0"><p className="font-mono text-xl text-primary">{explorer.summary.modelCount}</p><p className="mt-1 text-xs text-muted-foreground">dbt models</p></div>
        <div className="py-3 sm:px-4"><p className="font-mono text-xl text-primary">{explorer.summary.sourceCount}</p><p className="mt-1 text-xs text-muted-foreground">declared sources</p></div>
        <div className="py-3 sm:px-4"><p className="font-mono text-xl text-primary">{explorer.summary.passingTestCount}/{explorer.summary.testCount}</p><p className="mt-1 text-xs text-muted-foreground">tests passed</p></div>
        <div className="py-3 sm:px-4"><p className="font-mono text-xl text-primary">{explorer.project.commitSha.slice(0, 7)}</p><p className="mt-1 text-xs text-muted-foreground">pinned commit</p></div>
      </div>
      {/* Project-wide node count per layer (counts explorer.nodes, the whole
          project, same source as the stat grid above). Deliberately not a
          function of selectedNode: keep these badges here, next to the other
          global stats, rather than in the per-model lineage panel below,
          where their fixed value would misleadingly imply per-model scope. */}
      <div className="mt-4 flex flex-wrap gap-2">{modelLayers.map((layer) => <span key={layer} className="rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground">{layer}: {explorer.nodes.filter((node) => node.layer === layer).length}</span>)}</div>
    </div>

    <div className="grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="border-b border-border/70 bg-muted/20 lg:border-b-0 lg:border-r">
        <div className="border-b border-border/70 p-4">
          <label className="sr-only" htmlFor="pipeline-file-search">Search project files</label>
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"><Search className="h-4 w-4 text-muted-foreground" /><input id="pipeline-file-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear file search" title="Clear file search" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">{availableCategories.map((value) => <button key={value} type="button" onClick={() => setCategory(value)} className={`rounded-md border px-2 py-1 text-xs transition-colors ${category === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/50 text-muted-foreground hover:text-foreground"}`}>{categoryLabels[value] ?? displayName(value)}</button>)}</div>
        </div>
        <div className="max-h-[32rem] overflow-y-auto p-2">{filteredFiles.length ? <FileTree directory={fileTree} expandedDirectories={query ? searchExpandedDirectories : expandedDirectories} selectedFilePath={selectedFile?.path ?? null} onToggle={toggleDirectory} onSelect={selectFile} /> : <p className="px-3 py-6 text-center text-sm text-muted-foreground">No public project files match.</p>}</div>
      </aside>

      <div className="min-w-0">
        {selectedFile && <CodeViewer file={selectedFile} copied={copied} onCopy={copySource} onGithubOpen={() => onInteraction("pipeline_repository_opened", { pipeline_file_category: selectedFile.category })} />}
        <div className="grid border-t border-border/70 xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
          <div className="p-5 md:p-6">
            <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /><h3 className="font-semibold">Direct lineage</h3></div>
            {selectedNode ? <div className="mt-4 overflow-x-auto pb-2"><div className="grid min-w-[42rem] grid-cols-[minmax(10rem,1fr)_1.5rem_minmax(10rem,1fr)_1.5rem_minmax(10rem,1fr)] items-center gap-3">
              <div className="space-y-2">{upstream.length ? upstream.map((node) => <LineageNode key={node.id} node={node} onSelect={selectNode} />) : <p className="text-xs text-muted-foreground">No project upstreams</p>}</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <LineageNode node={selectedNode} active onSelect={selectNode} />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-2">{downstream.length ? downstream.map((node) => <LineageNode key={node.id} node={node} onSelect={selectNode} />) : <p className="text-xs text-muted-foreground">No project downstreams</p>}</div>
            </div></div> : <p className="mt-3 text-sm text-muted-foreground">Select a dbt model to inspect its direct dependencies.</p>}
          </div>

          <aside className="border-t border-border/70 bg-muted/15 p-5 xl:border-l xl:border-t-0 md:p-6">
            <div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-primary" /><h3 className="font-semibold">{selectedNode?.name ?? "File context"}</h3></div>
            {selectedNode ? <div className="mt-4 space-y-4 text-sm">
              <p className="leading-relaxed text-muted-foreground">{selectedNode.description || "This model is documented through its project layer, lineage, and attached dbt tests."}</p>
              <dl className="grid grid-cols-2 gap-3 text-xs"><div><dt className="text-muted-foreground">Layer</dt><dd className="mt-1 font-mono text-foreground">{selectedNode.layer}</dd></div><div><dt className="text-muted-foreground">Relation</dt><dd className="mt-1 truncate font-mono text-foreground">{selectedNode.relation ?? "Not materialized"}</dd></div><div><dt className="text-muted-foreground">Build</dt><dd className="mt-1 font-medium text-primary">{buildStatusLabel(selectedNode.buildStatus)}</dd></div><div><dt className="text-muted-foreground">Columns</dt><dd className="mt-1 font-mono text-foreground">{selectedNode.columns.length}</dd></div><div><dt className="text-muted-foreground">Materialization</dt><dd className="mt-1 font-mono text-foreground">{selectedNode.materialization ?? "None"}</dd></div><div><dt className="text-muted-foreground">Contract</dt><dd className="mt-1 font-mono text-foreground">{selectedNode.contractEnforced ? "Enforced" : "Not enforced"}</dd></div><div><dt className="text-muted-foreground">Owner</dt><dd className="mt-1 text-foreground">{typeof selectedNode.owner === "string" ? selectedNode.owner : selectedNode.owner?.name ?? "Not specified"}</dd></div><div><dt className="text-muted-foreground">Maturity</dt><dd className="mt-1 font-mono text-foreground">{selectedNode.maturity ?? "Not specified"}</dd></div></dl>
              <div><p className="text-xs text-muted-foreground">Attached tests</p><div className="mt-2 flex flex-wrap gap-1.5">{selectedNode.tests.length ? selectedNode.tests.map((test) => <span key={`${test.name}-${test.status}`} className="rounded-md border border-primary/30 bg-primary/5 px-2 py-1 font-mono text-[11px] text-primary">{test.name} · {buildStatusLabel(test.status)}</span>) : <span className="text-xs text-muted-foreground">No direct tests declared</span>}</div></div>
            </div> : <p className="mt-3 text-sm leading-relaxed text-muted-foreground">This public file is included to show how ingestion, dbt models, tests, and scheduled publishing work together.</p>}
          </aside>
        </div>
      </div>
    </div>
  </section>
}
