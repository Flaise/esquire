
/*
 * Like Array#filter except modifies the array instead of consuming the resources to create a new
 * one. Return `true` from the predicate to keep the element.
 */
export function filter(arr, predicate) {
    let shiftBy = 0
    for(let i = 0; i < arr.length; i += 1) {
        const element = arr[i]
        if(predicate(element))
            arr[i - shiftBy] = arr[i]
        else
            shiftBy += 1
    }
    arr.length = arr.length - shiftBy
}

/*
 * Inserts an element into a sorted array, such that the array remains
 * sorted. The `compare` function returns a negative number if the element to be inserted comes
 * before the given element already in the list, zero if it's the same with respect to sorting,
 * and a positive number if it comes after.
 */
export function insertSorted(arr, element, compare, context) {
    for(var i = 0; i < arr.length; i += 1) {
        if(compare.call(context, element, arr[i]) >= 0) {
            arr.splice(i, 0, element)
            return
        }
    }
    arr.push(element)
}

/*
 * Removes the first instance of the given element from the array, using strict equality.
 */
export function remove(arr, element) {
    const index = arr.indexOf(element)
    if(index >= 0)
        arr.splice(index, 1)
}
