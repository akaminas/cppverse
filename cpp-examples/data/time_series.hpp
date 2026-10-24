// Title: A class template for time series (header)
// Standard: C++17
// TimeSeries<T> stores one value of type T per time step. The whole
// template, including its member function definitions, lives in the header.

#ifndef TIME_SERIES_HPP
#define TIME_SERIES_HPP

#include <cstddef>
#include <vector>

template <typename T>
class TimeSeries {
public:
    void record(T value) { values_.push_back(value); }
    std::size_t size() const { return values_.size(); }
    T at(std::size_t t) const { return values_.at(t); }
    T peak() const;  // largest value; throws std::out_of_range if empty

private:
    std::vector<T> values_;
};

template <typename T>
T TimeSeries<T>::peak() const {
    T best = values_.at(0);
    for (const T& v : values_) {
        if (v > best) {
            best = v;
        }
    }
    return best;
}

#endif
