#![no_std]

pub fn compute(input: &[u8]) -> Result<Vec<u8>, ()> {
    if input.len() < 4 {
        return Err(());
    }

    let n = u32::from_le_bytes(input[0..4].try_into().map_err(|_| ())?) as usize;
    let expected_len = 4 + n * 4 + 2;
    if input.len() < expected_len {
        return Err(());
    }

    let current_weights: Vec<u16> = (0..n)
        .map(|i| u16::from_le_bytes(input[4 + i * 2..6 + i * 2].try_into().unwrap_or([0, 0])))
        .collect();

    let target_weights: Vec<u16> = (0..n)
        .map(|i| {
            u16::from_le_bytes(
                input[4 + n * 2 + i * 2..6 + n * 2 + i * 2]
                    .try_into()
                    .unwrap_or([0, 0]),
            )
        })
        .collect();

    let threshold = u16::from_le_bytes(input[4 + n * 4..6 + n * 4].try_into().map_err(|_| ())?);

    let needs_rebalance = current_weights
        .iter()
        .zip(target_weights.iter())
        .any(|(&c, &t)| abs_diff(c, t) > threshold);

    let mut output = Vec::with_capacity(1 + n * 2);
    output.push(if needs_rebalance { 1u8 } else { 0u8 });

    let output_weights = if needs_rebalance {
        &target_weights
    } else {
        &current_weights
    };
    for &w in output_weights {
        output.extend_from_slice(&w.to_le_bytes());
    }

    Ok(output)
}

fn abs_diff(a: u16, b: u16) -> u16 {
    if a > b {
        a - b
    } else {
        b - a
    }
}
