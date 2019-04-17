function mul(x){
    return function function1(y){
        return function function2(z){
            return x*y*z
        }
    }
}

console.log(mul(2)(3)(4))