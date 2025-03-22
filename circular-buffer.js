
class CircularBuffer {
  constructor(capacity) {
    this.buffer = new Array(capacity)
    this.capacity = capacity
    this.size = 0
    this.head = 0
    this.tail = 0
  }

  
  push(item) {
    this.buffer[this.head] = item

    this.head = (this.head + 1) % this.capacity

    if (this.size < this.capacity) {
      this.size++
    } else {
      this.tail = (this.tail + 1) % this.capacity
    }
  }


  getItems() {
    const result = []

    if (this.size === 0) {
      return result
    }

    let index = this.tail
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[index])
      index = (index + 1) % this.capacity
    }

    return result
  }

 
  isFull() {
    return this.size === this.capacity
  }

 
  getSize() {
    return this.size
  }

  clear() {
    this.size = 0
    this.head = 0
    this.tail = 0
  }
}

