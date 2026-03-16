#![no_std]
#![no_main]

mod allocation;
mod rebalance;
mod risk;

use core::slice;

#[no_mangle]
pub extern "C" fn optimize_allocation(
    input_ptr: *const u8,
    input_len: u32,
    output_ptr: *mut u8,
    output_len_ptr: *mut u32,
) -> i32 {
    let input = unsafe { slice::from_raw_parts(input_ptr, input_len as usize) };

    match allocation::optimize(input) {
        Ok(result) => {
            let out = unsafe { slice::from_raw_parts_mut(output_ptr, 1024) };
            let len = result.len().min(out.len());
            out[..len].copy_from_slice(&result[..len]);
            unsafe { *output_len_ptr = len as u32 };
            0
        }
        Err(_) => -1,
    }
}

#[no_mangle]
pub extern "C" fn rebalance_basket(
    input_ptr: *const u8,
    input_len: u32,
    output_ptr: *mut u8,
    output_len_ptr: *mut u32,
) -> i32 {
    let input = unsafe { slice::from_raw_parts(input_ptr, input_len as usize) };

    match rebalance::compute(input) {
        Ok(result) => {
            let out = unsafe { slice::from_raw_parts_mut(output_ptr, 1024) };
            let len = result.len().min(out.len());
            out[..len].copy_from_slice(&result[..len]);
            unsafe { *output_len_ptr = len as u32 };
            0
        }
        Err(_) => -1,
    }
}

#[no_mangle]
pub extern "C" fn risk_adjusted_yield(
    input_ptr: *const u8,
    input_len: u32,
    output_ptr: *mut u8,
    output_len_ptr: *mut u32,
) -> i32 {
    let input = unsafe { slice::from_raw_parts(input_ptr, input_len as usize) };

    match risk::compute(input) {
        Ok(result) => {
            let out = unsafe { slice::from_raw_parts_mut(output_ptr, 1024) };
            let len = result.len().min(out.len());
            out[..len].copy_from_slice(&result[..len]);
            unsafe { *output_len_ptr = len as u32 };
            0
        }
        Err(_) => -1,
    }
}
