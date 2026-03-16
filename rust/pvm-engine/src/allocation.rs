#![no_std]

const MOCK_YIELDS: &[u32] = &[800, 1400, 600];

const MAX_WEIGHT_BPS: u16 = 5000;
const MIN_WEIGHT_BPS: u16 = 1000;

pub fn optimize(input: &[u8]) -> Result<Vec<u8>, ()> {
    if input.len() < 4 {
        return Err(());
    }

    let n = u32::from_le_bytes(input[0..4].try_into().map_err(|_| ())?) as usize;
    let yields: &[u32] = if input.len() >= 4 + n * 4 {
        let bytes = &input[4..4 + n * 4];
        unsafe { core::slice::from_raw_parts(bytes.as_ptr() as *const u32, n) }
    } else {
        &MOCK_YIELDS[..n.min(MOCK_YIELDS.len())]
    };

    let total_yield: u32 = yields.iter().sum();
    if total_yield == 0 {
        return Err(());
    }

    let mut weights: Vec<u16> = yields
        .iter()
        .map(|&y| {
            let raw = ((y as u64 * 10000) / total_yield as u64) as u16;
            raw.max(MIN_WEIGHT_BPS).min(MAX_WEIGHT_BPS)
        })
        .collect();

    let total: u32 = weights.iter().map(|&w| w as u32).sum();
    if total != 10000 && !weights.is_empty() {
        let diff = 10000i32 - total as i32;
        weights[0] = (weights[0] as i32 + diff) as u16;
    }

    let mut output = Vec::with_capacity(n * 2);
    for w in &weights {
        output.extend_from_slice(&w.to_le_bytes());
    }
    Ok(output)
}
