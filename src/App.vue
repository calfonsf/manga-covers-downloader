<script setup lang="ts">
import { type resultsType, type coverType, type mangaType, type resultsCoverType, type isDownloadType } from "./types";
import JZip from "jszip"
import { saveAs } from "file-saver"
import { Ref, ref, watch } from "vue"
import MangaItem from "./components/mangaItem.vue";

const API = "https://api.mangadex.org";
const COVERS_API = "https://uploads.mangadex.org/covers";

const results = ref<resultsType[]>([]);
const search = ref("");
const mangas = ref<mangaType[]>([]);
const covers = ref<coverType[]>([]);
const isDownloading: Ref<isDownloadType | null> = ref(null);
const isLoading = ref(false);
const msg = ref("");

const getManga = (event: Event) => {

    event.preventDefault()

    if (search.value === "") {
        // put delay to this with a function
        msg.value = "Empty search"
        return
    }

    isLoading.value = true
    results.value = [];
    mangas.value = [];
    msg.value = "";

    const params = {
        title: search.value,
        "includes[]": "cover_art",
        "limit": "20"
    };

    fetch(`${API}/manga?` + new URLSearchParams(params))
        .then((res) => res.json())
        .then(({ data }) => (results.value = data))
        .then(() => {
            isLoading.value = false
            results.value.length === 0 ? msg.value = "No results" : ""
        })
}

const getCovers = (mangaID: string, title: string) => {

    covers.value = []
    fetch(`${API}/cover?limit=100&manga[]=${mangaID}`)
        .then(res => res.json())
        .then(({ data }) => data.map((cover: resultsCoverType) => {
            covers.value = [...covers.value, {
                id: mangaID,
                title: title,
                volume: cover.attributes.volume,
                url: `${COVERS_API}/${mangaID}/${cover.attributes.fileName}`,
            }
            ]
        }))
}

watch(results, () => {
    if (results.value.length > 0) {
        results.value.map((manga) => {
            let filename: string | undefined = "";
            for (const rel of manga.relationships) {
                if (rel.type === "cover_art") {
                    filename = rel.attributes?.fileName;
                }
            }

            mangas.value = [
                ...mangas.value,
                {
                    "id": manga.id,
                    "title": manga.attributes.title.en,
                    "cover": `${COVERS_API}/${manga.id}/${filename}.256.jpg`,
                },
            ];
        });
    }
})

watch(covers, () => {
    if (covers.value.length > 0) {
        getBlobs(covers.value[0].title)
    }
})

async function getBlobs(title: string) {
    isDownloading.value = { total: covers.value.length, current: 0 }
    await Promise.all(covers.value.map(async (cover) => {
        const res = await fetch(cover.url)
        const blob = await res.blob()
        if (isDownloading.value != null) {
            isDownloading.value.current = isDownloading.value.current + 1
        }
        cover.blob = blob
        return cover
    }))
    const zip = new JZip()

    await Promise.all(covers.value.map(cover => {
        zip.file(`volume_${cover.volume}.jpg`, cover.blob)
    }))

    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            saveAs(content, `${title}.zip`);
        });

    isDownloading.value = null
}
</script>

<template>
    <main>
        <h1>Manga Covers</h1>
        <div class="search-box">
            <form @submit="getManga($event)">
                <input class="search-input" type="text" placeholder="Search for covers" v-model="search" />
                <button class="search-btn">
                    <svg data-v-9ba4cb7e="" data-v-3f97b1e0="" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                        fill="none" viewBox="0 0 24 24" class="icon small text-icon-contrast text-undefined">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16m10 2-4.35-4.35"></path>
                    </svg>
                </button>
            </form>
        </div>

        <div v-if="msg" class="err">
            {{ msg }}
        </div>

        <div v-if="mangas.length > 0">
            <h2>Results</h2>
            <p>Click the manga to download covers</p>
            <div v-if="isDownloading">
                Downloading covers {{ isDownloading.current }} / {{ isDownloading.total }}
            </div>
            <div v-if="isLoading">
                Loading ...
            </div>
            <ul class="manga-list">
                <MangaItem v-for="manga in mangas" :manga="manga" @get-covers="getCovers" />
            </ul>
        </div>
    </main>
</template>

<style scoped>
.manga-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
}

.search-box {
    gap: 10px;
    justify-content: center;
    display: flex;
}

.search-btn {
    padding: 10px;
}

.search-input {
    padding: 10px;
}

.err {
    color: #dc2e1b;
    margin: 10px;
}
</style>
