import mongoose from "mongoose";
import dotenv from "dotenv";
import DsaChallenge from "../src/models/DsaChallenge.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const dsaChallenges = [
    {
        dayNumber: 1,
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        difficulty: "Easy",
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists"
        ],
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation: "nums[1] + nums[2] == 6"
            }
        ],
        hints: ["Use a hash map to store numbers you've seen", "For each number, check if target - number exists in the map"],
        tags: ["Array", "Hash Table"],
        testCases: [
            { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
            { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
            { input: "[3,3], 6", expectedOutput: "[0,1]" }
        ]
    },
    {
        dayNumber: 2,
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters `s`. You must do this by modifying the input array in-place with O(1) extra memory.",
        difficulty: "Easy",
        constraints: [
            "1 <= s.length <= 10^5",
            "s[i] is a printable ascii character"
        ],
        examples: [
            {
                input: 's = ["h","e","l","l","o"]',
                output: '["o","l","l","e","h"]',
                explanation: "Reverse the array in-place"
            }
        ],
        hints: ["Use two pointers", "Swap characters from both ends moving towards center"],
        tags: ["Two Pointers", "String"],
        testCases: [
            { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
            { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' }
        ]
    },
    {
        dayNumber: 3,
        title: "Valid Palindrome",
        description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
        difficulty: "Easy",
        constraints: [
            "1 <= s.length <= 2 * 10^5",
            "s consists only of printable ASCII characters"
        ],
        examples: [
            {
                input: 's = "A man, a plan, a canal: Panama"',
                output: "true",
                explanation: '"amanaplanacanalpanama" is a palindrome'
            },
            {
                input: 's = "race a car"',
                output: "false",
                explanation: '"raceacar" is not a palindrome'
            }
        ],
        hints: ["Clean the string first", "Use two pointers from both ends"],
        tags: ["Two Pointers", "String"],
        testCases: [
            { input: '"A man, a plan, a canal: Panama"', expectedOutput: "true" },
            { input: '"race a car"', expectedOutput: "false" }
        ]
    },
    {
        dayNumber: 4,
        title: "Maximum Subarray",
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        difficulty: "Medium",
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4"
        ],
        examples: [
            {
                input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
                output: "6",
                explanation: "The subarray [4,-1,2,1] has the largest sum 6"
            }
        ],
        hints: ["Use Kadane's Algorithm", "Keep track of current sum and max sum"],
        tags: ["Array", "Dynamic Programming"],
        testCases: [
            { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
            { input: "[1]", expectedOutput: "1" },
            { input: "[5,4,-1,7,8]", expectedOutput: "23" }
        ]
    },
    {
        dayNumber: 5,
        title: "Contains Duplicate",
        description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
        difficulty: "Easy",
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^9 <= nums[i] <= 10^9"
        ],
        examples: [
            {
                input: "nums = [1,2,3,1]",
                output: "true",
                explanation: "1 appears twice"
            },
            {
                input: "nums = [1,2,3,4]",
                output: "false",
                explanation: "All elements are distinct"
            }
        ],
        hints: ["Use a Set to track seen numbers", "Return true as soon as you find a duplicate"],
        tags: ["Array", "Hash Table"],
        testCases: [
            { input: "[1,2,3,1]", expectedOutput: "true" },
            { input: "[1,2,3,4]", expectedOutput: "false" }
        ]
    },
    {
        dayNumber: 6,
        title: "Valid Anagram",
        description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
        difficulty: "Easy",
        constraints: [
            "1 <= s.length, t.length <= 5 * 10^4",
            "s and t consist of lowercase English letters"
        ],
        examples: [
            {
                input: 's = "anagram", t = "nagaram"',
                output: "true",
                explanation: "Both have same characters"
            },
            {
                input: 's = "rat", t = "car"',
                output: "false",
                explanation: "Different characters"
            }
        ],
        hints: ["Count character frequencies", "Compare frequency maps"],
        tags: ["Hash Table", "String", "Sorting"],
        testCases: [
            { input: '"anagram", "nagaram"', expectedOutput: "true" },
            { input: '"rat", "car"', expectedOutput: "false" }
        ]
    },
    {
        dayNumber: 7,
        title: "Binary Search",
        description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.",
        difficulty: "Easy",
        constraints: [
            "1 <= nums.length <= 10^4",
            "-10^4 < nums[i], target < 10^4",
            "All integers in nums are unique",
            "nums is sorted in ascending order"
        ],
        examples: [
            {
                input: "nums = [-1,0,3,5,9,12], target = 9",
                output: "4",
                explanation: "9 exists in nums and its index is 4"
            }
        ],
        hints: ["Use binary search algorithm", "Compare middle element with target"],
        tags: ["Array", "Binary Search"],
        testCases: [
            { input: "[-1,0,3,5,9,12], 9", expectedOutput: "4" },
            { input: "[-1,0,3,5,9,12], 2", expectedOutput: "-1" }
        ]
    },
    {
        dayNumber: 8,
        title: "Merge Two Sorted Lists",
        description: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
        difficulty: "Easy",
        constraints: [
            "The number of nodes in both lists is in the range [0, 50]",
            "-100 <= Node.val <= 100",
            "Both list1 and list2 are sorted in non-decreasing order"
        ],
        examples: [
            {
                input: "list1 = [1,2,4], list2 = [1,3,4]",
                output: "[1,1,2,3,4,4]",
                explanation: "Merge both sorted lists"
            }
        ],
        hints: ["Use a dummy node", "Compare values and link nodes"],
        tags: ["Linked List", "Recursion"],
        testCases: [
            { input: "[1,2,4], [1,3,4]", expectedOutput: "[1,1,2,3,4,4]" },
            { input: "[], []", expectedOutput: "[]" }
        ]
    },
    {
        dayNumber: 9,
        title: "Best Time to Buy and Sell Stock",
        description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        difficulty: "Easy",
        constraints: [
            "1 <= prices.length <= 10^5",
            "0 <= prices[i] <= 10^4"
        ],
        examples: [
            {
                input: "prices = [7,1,5,3,6,4]",
                output: "5",
                explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5"
            }
        ],
        hints: ["Track minimum price seen so far", "Calculate profit at each step"],
        tags: ["Array", "Dynamic Programming"],
        testCases: [
            { input: "[7,1,5,3,6,4]", expectedOutput: "5" },
            { input: "[7,6,4,3,1]", expectedOutput: "0" }
        ]
    },
    {
        dayNumber: 10,
        title: "Valid Parentheses",
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
        difficulty: "Easy",
        constraints: [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'."
        ],
        examples: [
            {
                input: 's = "()"',
                output: "true",
                explanation: "Valid parentheses"
            },
            {
                input: 's = "()[]{}"',
                output: "true",
                explanation: "All brackets match"
            },
            {
                input: 's = "(]"',
                output: "false",
                explanation: "Mismatched brackets"
            }
        ],
        hints: ["Use a stack", "Push opening brackets, pop for closing"],
        tags: ["String", "Stack"],
        testCases: [
            { input: '"()"', expectedOutput: "true" },
            { input: '"()[]{}"', expectedOutput: "true" },
            { input: '"(]"', expectedOutput: "false" }
        ]
    },
    {
        dayNumber: 11,
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: "Easy",
        constraints: [
            "1 <= n <= 45"
        ],
        examples: [
            {
                input: "n = 2",
                output: "2",
                explanation: "There are two ways: 1+1 or 2"
            },
            {
                input: "n = 3",
                output: "3",
                explanation: "Three ways: 1+1+1, 1+2, or 2+1"
            }
        ],
        hints: ["This is a Fibonacci sequence", "Use dynamic programming"],
        tags: ["Math", "Dynamic Programming"],
        testCases: [
            { input: "2", expectedOutput: "2" },
            { input: "3", expectedOutput: "3" },
            { input: "5", expectedOutput: "8" }
        ]
    },
    {
        dayNumber: 12,
        title: "Linked List Cycle",
        description: "Given `head`, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.",
        difficulty: "Easy",
        constraints: [
            "The number of nodes in the list is in the range [0, 10^4]",
            "-10^5 <= Node.val <= 10^5"
        ],
        examples: [
            {
                input: "head = [3,2,0,-4], pos = 1",
                output: "true",
                explanation: "There is a cycle where the tail connects to the 1st node"
            }
        ],
        hints: ["Use Floyd's cycle detection (slow and fast pointers)", "If fast catches slow, there's a cycle"],
        tags: ["Linked List", "Two Pointers"],
        testCases: [
            { input: "[3,2,0,-4], pos=1", expectedOutput: "true" },
            { input: "[1], pos=-1", expectedOutput: "false" }
        ]
    },
    {
        dayNumber: 13,
        title: "Reverse Linked List",
        description: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
        difficulty: "Easy",
        constraints: [
            "The number of nodes in the list is the range [0, 5000]",
            "-5000 <= Node.val <= 5000"
        ],
        examples: [
            {
                input: "head = [1,2,3,4,5]",
                output: "[5,4,3,2,1]",
                explanation: "Reverse the linked list"
            }
        ],
        hints: ["Use three pointers: prev, current, next", "Iteratively reverse links"],
        tags: ["Linked List", "Recursion"],
        testCases: [
            { input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]" },
            { input: "[1,2]", expectedOutput: "[2,1]" }
        ]
    },
    {
        dayNumber: 14,
        title: "Middle of Linked List",
        description: "Given the `head` of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node.",
        difficulty: "Easy",
        constraints: [
            "The number of nodes in the list is in the range [1, 100]",
            "1 <= Node.val <= 100"
        ],
        examples: [
            {
                input: "head = [1,2,3,4,5]",
                output: "[3,4,5]",
                explanation: "The middle node is 3"
            }
        ],
        hints: ["Use slow and fast pointers", "When fast reaches end, slow is at middle"],
        tags: ["Linked List", "Two Pointers"],
        testCases: [
            { input: "[1,2,3,4,5]", expectedOutput: "[3,4,5]" },
            { input: "[1,2,3,4,5,6]", expectedOutput: "[4,5,6]" }
        ]
    },
    {
        dayNumber: 15,
        title: "Remove Duplicates from Sorted Array",
        description: "Given an integer array `nums` sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Return the number of unique elements in `nums`.",
        difficulty: "Easy",
        constraints: [
            "1 <= nums.length <= 3 * 10^4",
            "-100 <= nums[i] <= 100",
            "nums is sorted in non-decreasing order"
        ],
        examples: [
            {
                input: "nums = [1,1,2]",
                output: "2, nums = [1,2,_]",
                explanation: "Your function should return k = 2, with the first two elements of nums being 1 and 2"
            }
        ],
        hints: ["Use two pointers", "One for reading, one for writing unique elements"],
        tags: ["Array", "Two Pointers"],
        testCases: [
            { input: "[1,1,2]", expectedOutput: "2" },
            { input: "[0,0,1,1,1,2,2,3,3,4]", expectedOutput: "5" }
        ]
    },
    {
        dayNumber: 16,
        title: "Move Zeroes",
        description: "Given an integer array `nums`, move all 0's to the end of it while maintaining the relative order of the non-zero elements. Note that you must do this in-place without making a copy of the array.",
        difficulty: "Easy",
        constraints: [
            "1 <= nums.length <= 10^4",
            "-2^31 <= nums[i] <= 2^31 - 1"
        ],
        examples: [
            {
                input: "nums = [0,1,0,3,12]",
                output: "[1,3,12,0,0]",
                explanation: "Move all zeros to the end"
            }
        ],
        hints: ["Use two pointers", "Swap non-zero elements to the front"],
        tags: ["Array", "Two Pointers"],
        testCases: [
            { input: "[0,1,0,3,12]", expectedOutput: "[1,3,12,0,0]" },
            { input: "[0]", expectedOutput: "[0]" }
        ]
    },
    {
        dayNumber: 17,
        title: "Find First and Last Position",
        description: "Given an array of integers `nums` sorted in non-decreasing order, find the starting and ending position of a given `target` value. If `target` is not found in the array, return `[-1, -1]`. You must write an algorithm with O(log n) runtime complexity.",
        difficulty: "Medium",
        constraints: [
            "0 <= nums.length <= 10^5",
            "-10^9 <= nums[i] <= 10^9",
            "nums is a non-decreasing array",
            "-10^9 <= target <= 10^9"
        ],
        examples: [
            {
                input: "nums = [5,7,7,8,8,10], target = 8",
                output: "[3,4]",
                explanation: "8 appears at indices 3 and 4"
            }
        ],
        hints: ["Use binary search twice", "Once for leftmost, once for rightmost"],
        tags: ["Array", "Binary Search"],
        testCases: [
            { input: "[5,7,7,8,8,10], 8", expectedOutput: "[3,4]" },
            { input: "[5,7,7,8,8,10], 6", expectedOutput: "[-1,-1]" }
        ]
    },
    {
        dayNumber: 18,
        title: "Sqrt(x)",
        description: "Given a non-negative integer `x`, return the square root of `x` rounded down to the nearest integer. The returned integer should be non-negative as well. You must not use any built-in exponent function or operator.",
        difficulty: "Easy",
        constraints: [
            "0 <= x <= 2^31 - 1"
        ],
        examples: [
            {
                input: "x = 4",
                output: "2",
                explanation: "The square root of 4 is 2"
            },
            {
                input: "x = 8",
                output: "2",
                explanation: "The square root of 8 is 2.82842..., rounded down to 2"
            }
        ],
        hints: ["Use binary search", "Search for the largest number whose square is <= x"],
        tags: ["Math", "Binary Search"],
        testCases: [
            { input: "4", expectedOutput: "2" },
            { input: "8", expectedOutput: "2" }
        ]
    },
    {
        dayNumber: 19,
        title: "Single Number",
        description: "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.",
        difficulty: "Easy",
        constraints: [
            "1 <= nums.length <= 3 * 10^4",
            "-3 * 10^4 <= nums[i] <= 3 * 10^4",
            "Each element in the array appears twice except for one element which appears only once"
        ],
        examples: [
            {
                input: "nums = [2,2,1]",
                output: "1",
                explanation: "1 appears only once"
            },
            {
                input: "nums = [4,1,2,1,2]",
                output: "4",
                explanation: "4 appears only once"
            }
        ],
        hints: ["Use XOR operation", "a XOR a = 0, a XOR 0 = a"],
        tags: ["Array", "Bit Manipulation"],
        testCases: [
            { input: "[2,2,1]", expectedOutput: "1" },
            { input: "[4,1,2,1,2]", expectedOutput: "4" }
        ]
    },
    {
        dayNumber: 20,
        title: "Majority Element",
        description: "Given an array `nums` of size `n`, return the majority element. The majority element is the element that appears more than ⌊n / 2⌋ times. You may assume that the majority element always exists in the array.",
        difficulty: "Easy",
        constraints: [
            "n == nums.length",
            "1 <= n <= 5 * 10^4",
            "-10^9 <= nums[i] <= 10^9"
        ],
        examples: [
            {
                input: "nums = [3,2,3]",
                output: "3",
                explanation: "3 appears twice"
            },
            {
                input: "nums = [2,2,1,1,1,2,2]",
                output: "2",
                explanation: "2 appears 4 times"
            }
        ],
        hints: ["Use Boyer-Moore Voting Algorithm", "Or use a hash map to count frequencies"],
        tags: ["Array", "Hash Table"],
        testCases: [
            { input: "[3,2,3]", expectedOutput: "3" },
            { input: "[2,2,1,1,1,2,2]", expectedOutput: "2" }
        ]
    },
    {
        dayNumber: 21,
        title: "Intersection of Two Arrays II",
        description: "Given two integer arrays `nums1` and `nums2`, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays and you may return the result in any order.",
        difficulty: "Easy",
        constraints: [
            "1 <= nums1.length, nums2.length <= 1000",
            "0 <= nums1[i], nums2[i] <= 1000"
        ],
        examples: [
            {
                input: "nums1 = [1,2,2,1], nums2 = [2,2]",
                output: "[2,2]",
                explanation: "2 appears twice in both"
            }
        ],
        hints: ["Use hash map to count frequencies", "Take minimum count for each number"],
        tags: ["Array", "Hash Table"],
        testCases: [
            { input: "[1,2,2,1], [2,2]", expectedOutput: "[2,2]" },
            { input: "[4,9,5], [9,4,9,8,4]", expectedOutput: "[4,9]" }
        ]
    },
    {
        dayNumber: 22,
        title: "Plus One",
        description: "You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0's. Increment the large integer by one and return the resulting array of digits.",
        difficulty: "Easy",
        constraints: [
            "1 <= digits.length <= 100",
            "0 <= digits[i] <= 9",
            "digits does not contain any leading 0's"
        ],
        examples: [
            {
                input: "digits = [1,2,3]",
                output: "[1,2,4]",
                explanation: "The array represents 123, increment to 124"
            },
            {
                input: "digits = [9,9,9]",
                output: "[1,0,0,0]",
                explanation: "999 + 1 = 1000"
            }
        ],
        hints: ["Handle carry", "Start from the last digit"],
        tags: ["Array", "Math"],
        testCases: [
            { input: "[1,2,3]", expectedOutput: "[1,2,4]" },
            { input: "[9,9,9]", expectedOutput: "[1,0,0,0]" }
        ]
    },
    {
        dayNumber: 23,
        title: "Missing Number",
        description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
        difficulty: "Easy",
        constraints: [
            "n == nums.length",
            "1 <= n <= 10^4",
            "0 <= nums[i] <= n",
            "All the numbers of nums are unique"
        ],
        examples: [
            {
                input: "nums = [3,0,1]",
                output: "2",
                explanation: "n = 3, numbers are [0,1,3], missing is 2"
            }
        ],
        hints: ["Use sum formula: n*(n+1)/2", "Subtract sum of array from expected sum"],
        tags: ["Array", "Math", "Bit Manipulation"],
        testCases: [
            { input: "[3,0,1]", expectedOutput: "2" },
            { input: "[0,1]", expectedOutput: "2" }
        ]
    },
    {
        dayNumber: 24,
        title: "Power of Two",
        description: "Given an integer `n`, return `true` if it is a power of two. Otherwise, return `false`. An integer `n` is a power of two, if there exists an integer `x` such that `n == 2^x`.",
        difficulty: "Easy",
        constraints: [
            "-2^31 <= n <= 2^31 - 1"
        ],
        examples: [
            {
                input: "n = 1",
                output: "true",
                explanation: "2^0 = 1"
            },
            {
                input: "n = 16",
                output: "true",
                explanation: "2^4 = 16"
            },
            {
                input: "n = 3",
                output: "false",
                explanation: "Not a power of 2"
            }
        ],
        hints: ["Use bit manipulation", "Power of 2 has only one bit set: n & (n-1) == 0"],
        tags: ["Math", "Bit Manipulation"],
        testCases: [
            { input: "1", expectedOutput: "true" },
            { input: "16", expectedOutput: "true" },
            { input: "3", expectedOutput: "false" }
        ]
    },
    {
        dayNumber: 25,
        title: "Fizz Buzz",
        description: "Given an integer `n`, return a string array `answer` (1-indexed) where: answer[i] == 'FizzBuzz' if i is divisible by 3 and 5. answer[i] == 'Fizz' if i is divisible by 3. answer[i] == 'Buzz' if i is divisible by 5. answer[i] == i (as a string) if none of the above conditions are true.",
        difficulty: "Easy",
        constraints: [
            "1 <= n <= 10^4"
        ],
        examples: [
            {
                input: "n = 3",
                output: '["1","2","Fizz"]',
                explanation: "3 is divisible by 3"
            },
            {
                input: "n = 5",
                output: '["1","2","Fizz","4","Buzz"]',
                explanation: "5 is divisible by 5"
            }
        ],
        hints: ["Check divisibility by 15 first", "Then check 3 and 5"],
        tags: ["Math", "String"],
        testCases: [
            { input: "3", expectedOutput: '["1","2","Fizz"]' },
            { input: "5", expectedOutput: '["1","2","Fizz","4","Buzz"]' }
        ]
    },
    {
        dayNumber: 26,
        title: "First Unique Character",
        description: "Given a string `s`, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
        difficulty: "Easy",
        constraints: [
            "1 <= s.length <= 10^5",
            "s consists of only lowercase English letters"
        ],
        examples: [
            {
                input: 's = "leetcode"',
                output: "0",
                explanation: "'l' is the first character that appears only once"
            },
            {
                input: 's = "loveleetcode"',
                output: "2",
                explanation: "'v' is the first unique character"
            }
        ],
        hints: ["Count character frequencies", "Find first character with count 1"],
        tags: ["Hash Table", "String"],
        testCases: [
            { input: '"leetcode"', expectedOutput: "0" },
            { input: '"loveleetcode"', expectedOutput: "2" }
        ]
    },
    {
        dayNumber: 27,
        title: "Ransom Note",
        description: "Given two strings `ransomNote` and `magazine`, return `true` if `ransomNote` can be constructed by using the letters from `magazine` and `false` otherwise. Each letter in `magazine` can only be used once in `ransomNote`.",
        difficulty: "Easy",
        constraints: [
            "1 <= ransomNote.length, magazine.length <= 10^5",
            "ransomNote and magazine consist of lowercase English letters"
        ],
        examples: [
            {
                input: 'ransomNote = "a", magazine = "b"',
                output: "false",
                explanation: "'a' is not in magazine"
            },
            {
                input: 'ransomNote = "aa", magazine = "aab"',
                output: "true",
                explanation: "Two 'a's are available"
            }
        ],
        hints: ["Count character frequencies in magazine", "Check if ransomNote can be formed"],
        tags: ["Hash Table", "String"],
        testCases: [
            { input: '"a", "b"', expectedOutput: "false" },
            { input: '"aa", "aab"', expectedOutput: "true" }
        ]
    },
    {
        dayNumber: 28,
        title: "Reverse Vowels of a String",
        description: "Given a string `s`, reverse only all the vowels in the string and return it. The vowels are 'a', 'e', 'i', 'o', and 'u', and they can appear in both lower and upper cases, more than once.",
        difficulty: "Easy",
        constraints: [
            "1 <= s.length <= 3 * 10^5",
            "s consist of printable ASCII characters"
        ],
        examples: [
            {
                input: 's = "hello"',
                output: '"holle"',
                explanation: "Reverse 'e' and 'o'"
            }
        ],
        hints: ["Use two pointers", "Swap vowels from both ends"],
        tags: ["Two Pointers", "String"],
        testCases: [
            { input: '"hello"', expectedOutput: '"holle"' },
            { input: '"leetcode"', expectedOutput: '"leotcede"' }
        ]
    },
    {
        dayNumber: 29,
        title: "Is Subsequence",
        description: "Given two strings `s` and `t`, return `true` if `s` is a subsequence of `t`, or `false` otherwise. A subsequence of a string is a new string that is formed from the original string by deleting some (can be none) of the characters without disturbing the relative positions of the remaining characters.",
        difficulty: "Easy",
        constraints: [
            "0 <= s.length <= 100",
            "0 <= t.length <= 10^4",
            "s and t consist only of lowercase English letters"
        ],
        examples: [
            {
                input: 's = "abc", t = "ahbgdc"',
                output: "true",
                explanation: "a, b, c appear in order in t"
            },
            {
                input: 's = "axc", t = "ahbgdc"',
                output: "false",
                explanation: "x is not in t"
            }
        ],
        hints: ["Use two pointers", "Match characters in order"],
        tags: ["Two Pointers", "String"],
        testCases: [
            { input: '"abc", "ahbgdc"', expectedOutput: "true" },
            { input: '"axc", "ahbgdc"', expectedOutput: "false" }
        ]
    },
    {
        dayNumber: 30,
        title: "Length of Last Word",
        description: "Given a string `s` consisting of words and spaces, return the length of the last word in the string. A word is a maximal substring consisting of non-space characters only.",
        difficulty: "Easy",
        constraints: [
            "1 <= s.length <= 10^4",
            "s consists of only English letters and spaces ' '",
            "There will be at least one word in s"
        ],
        examples: [
            {
                input: 's = "Hello World"',
                output: "5",
                explanation: "The last word is 'World' with length 5"
            },
            {
                input: 's = "   fly me   to   the moon  "',
                output: "4",
                explanation: "The last word is 'moon' with length 4"
            }
        ],
        hints: ["Trim trailing spaces", "Find last space and count characters after it"],
        tags: ["String"],
        testCases: [
            { input: '"Hello World"', expectedOutput: "5" },
            { input: '"   fly me   to   the moon  "', expectedOutput: "4" }
        ]
    }
];

const seedDsaChallenges = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing challenges
        await DsaChallenge.deleteMany({});
        console.log("🗑️  Cleared existing DSA challenges");

        // Insert new challenges
        await DsaChallenge.insertMany(dsaChallenges);
        console.log(`✨ Successfully seeded ${dsaChallenges.length} DSA challenges!`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDsaChallenges();
