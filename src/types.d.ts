import mangaMock from "./mocks/manga.json"
import coverMock from "./mocks/cover.json"

type resultsType = typeof mangaMock
type resultsCoverType = typeof coverMock

type mangaType = {
    id: string  
    title: string
    cover: string
}

type coverType = {
    id: string
    title: string    
    volume: string
    url: string
    blob?: Blob
}

type isDownloadType = {
    total: number,
    current: number
}

//{
//    "id": manga.id,
//    "title": manga.attributes.title.en,
//    "cover": `${COVERS_API}/${manga.id}/${filename}.256.jpg`,
//},

// id: mangaID,
// title: title,
// volume:cover.attributes.volume ,
// url:`${COVERS_API}/${mangaID}/${cover.attributes.fileName}`