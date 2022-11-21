export const testData = {
    users: [
        {id: 1, name: "Andre", token: "abc"},
        {id: 2, name: "Monteiro", token: "zxc"},
    ],
    id1Groups:[
        {
            "id": 1,
            "name": "Action",
            "description": "Action movies",
            "movies": [
                "tt1",
                "tt2",
                "tt3",
                "tt4"
            ],
            "totalDuration": 671,
            "userId": 1
        },
        {
            "id": 4,
            "name": "Sci-Fi",
            "description": "Sci-Fi movies",
            "movies": [
                "tt1",
                "tt2",
                "tt3",
                "tt4"
            ],
            "totalDuration": 671,
            "userId": 1
        }
    ],
    groupNotFoundError : {
        code: 3,
        message: `Groups not found`
    },
    invalidToken : "for now proper tokens are not specified"
}