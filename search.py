import os
import re
import base64
import json
import zlib
from datetime import datetime

path = '/mnt/data/.../root/ba-verl-v2/logs/2025_09_14_16_34_appworldqwen2-bz32-tp4-linear-think-1mini-hardpeneltymadness-nokl-resume6/rollout'

# read rollout.json.*.log from path
all_files = os.listdir(path)
rollout_files = [f for f in all_files if f.startswith('rollout.json.')and f.endswith('.log')]

# 定义一个函数来提取时间戳并转换为 datetime 对象
def extract_timestamp(filename):
    # 检查是否为没有时间戳的文件
    if filename == "rollout.json.log":
        # 返回一个未来的时间，确保它排在最后
        return datetime.max

    # 使用正则表达式提取时间戳部分
    match = re.search(r'rollout\.json\.(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})_\d+\.log', filename)
    if match:
        timestamp_str = match.group(1)
        # 将时间戳字符串转换为 datetime 对象
        return datetime.strptime(timestamp_str, '%Y-%m-%d_%H-%M-%S')

    # 如果无法提取时间戳，也放在最后
    return datetime.max

# 按照时间戳排序
sorted_rollout_files = sorted(rollout_files, key=extract_timestamp)


# 打印排序后的结果
for file in sorted_rollout_files:
    print(os.path.join(path, file))
print(f"Found {len(rollout_files)} rollout files")

def extract_base64_from_log(file_path):
    """Extract base64 encoded data from log file"""
    base64_items = []

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            # Look for lines containing "base64:" pattern
            if 'base64:' in line:
                # Extract the base64 string after "base64:"
                match = re.search(r'base64:([A-Za-z0-9+/=]+)', line)
                if match:
                    base64_str = match.group(1)
                    try:
                        # Decode the base64 data
                        compressed_data = base64.b64decode(base64_str)
                        # Decompress the zlib data
                        decompressed_data = zlib.decompress(compressed_data)
                        # Decode to text
                        decoded_text = decompressed_data.decode('utf-8')
                        base64_items.append({
                            'decoded_text': json.loads(decoded_text)
                        })
                    except Exception as e:
                        print(f"Error decoding base64 in {file_path}: {e}")
                        base64_items.append({
                            'raw_base64': base64_str,
                            'error': str(e)
                        })

    return base64_items

def find_sublist_kmp(list_to_search, sublist):
    """使用KMP算法查找子列表位置"""
    if not sublist:
        return 0

    if len(sublist) > len(list_to_search):
        return -1

    # 计算部分匹配表
    def compute_lps(pattern):
        m = len(pattern)
        lps = [0] * m

        length = 0
        i = 1

        while i < m:
            if pattern[i] == pattern[length]:
                length += 1
                lps[i] = length
                i += 1
            else:
                if length != 0:
                    length = lps[length - 1]
                else:
                    lps[i] = 0
                    i += 1
        return lps

    lps = compute_lps(sublist)

    i = 0  # 主列表索引
    j = 0  # 子列表索引

    while i < len(list_to_search):
        if sublist[j] == list_to_search[i]:
            i += 1
            j += 1

        if j == len(sublist):
            return i - j
        elif i < len(list_to_search) and sublist[j] != list_to_search[i]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1

    return -1

# Process all rollout files
all_base64_data = {}

objective = 'search_token'
# objective_target = ['73594', '137162', '124324']
# objective_target = [13708, 766, 29, 75738]
objective_target = [135075]


matched_results = []
matched_rollouts = []

from beast_logger import print_listofdict

objective_target = [str(x) for x in objective_target]  # convert to str for matching

for rollout_file in rollout_files:
    file_path = os.path.join(path, rollout_file)
    print(f"Searching {rollout_file}...")

    base64_items = extract_base64_from_log(file_path)
    all_base64_data[rollout_file] = base64_items

    for nested_json in base64_items:
        rollout = nested_json['decoded_text']['nested_json']
        for rollout_step_key, rollout_step in rollout.items():
            list_to_search = rollout_step['content']['count']
            index = find_sublist_kmp(list_to_search, objective_target)
            if index != -1:
                matched_results += [{
                    'file': rollout_file,
                    'step': rollout_step_key,
                    'raw_reward': rollout_step['raw_reward'],
                    'step_reward': rollout_step['step_reward'],
                    'step_advantage_simple': rollout_step['step_advantage_simple'],
                }]
                matched_rollouts += [rollout_step]
                print_listofdict(matched_results)

    print(f"Searched {len(base64_items)} items in {rollout_file}")

