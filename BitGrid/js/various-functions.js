const indexSubInArray = (subArray, array) => {
    if(!Array.isArray(subArray) || !Array.isArray(array))
        throw 'É somente aceito valores do tipo \'array\'';
    
    let index = -1;
    for(let i=0; i<array.length; i++) {
        if(!Array.isArray(array[i]))
            continue;
        let incluiTodos = true;
        if(array[i].length !== subArray.length)
            incluiTodos = false;
        else {
            for(let j=0; j<subArray.length; j++) {
                if(subArray[j] !== array[i][j])
                    incluiTodos = false;
            };
        };
        if(incluiTodos) {
            index = i;
            break;
        };
    };
    return index;
};
