export const testData = {
    mochUser:
        {id: 1, name: "Andre", token: "abc"}
    ,
    mochUserGroups:[
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
    notUserGroup: {
        id: 2,
        name: "Drama",
        description: "Drama movies",
        movies: ["tt1", "tt2", "tt3"],
        totalDuration: 519,
        userId: 2
    },
    groupNotFoundError : {
        code: 3,
        message: `Groups not found`
    },
    invalidToken : "for now proper tokens are not specified",
    intInjection: 999
}