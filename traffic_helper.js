function search (arr, elem) {
    let i
    const dim = arr.length
    for(i=0;i<dim;i++){
        if(arr[i] == elem) return true
    }
    return false
}

function addressOK (str) {
    const dim = str.length
    let i
    for(i=0;i<dim;i++) {
        if(!isNaN(parseInt(str[i]))) return false
    }
    return true
}

function getLatLong () {
    // WORK IN PROGRESS FOR REFACTORING
    
    // let pick_point_end_url = config.get('pick_point_end');
}

exports.search = search
exports.addressOK = addressOK