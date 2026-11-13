use fsrs::{FSRS, MemoryState};
static mut OUTPUT: [f32; 12] = [0.0; 12];

/// Single-threaded C ABI: three floats per rating (stability, difficulty, days).
/// The engine is the unmodified upstream FSRS Rust crate, not an approximation.
#[no_mangle]
pub extern "C" fn schedule(stability: f32, difficulty: f32, retention: f32, elapsed: u32) -> *const f32 {
    let model = FSRS::new(&[]).expect("valid FSRS defaults");
    let previous = if stability > 0.0 { Some(MemoryState {stability,difficulty}) } else {None};
    let states = model.next_states(previous, retention.clamp(0.7,0.99), elapsed).expect("valid scheduling input");
    let ratings = [states.again,states.hard,states.good,states.easy];
    unsafe {
        for (i,state) in ratings.iter().enumerate() {
            OUTPUT[i*3] = state.memory.stability;
            OUTPUT[i*3+1] = state.memory.difficulty;
            OUTPUT[i*3+2] = state.interval;
        }
        core::ptr::addr_of!(OUTPUT) as *const f32
    }
}
