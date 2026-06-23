package org.example.cinema.service;

import org.example.cinema.dto.CountryRequest;
import org.example.cinema.dto.CountryResponse;
import org.example.cinema.entity.Country;
import org.example.cinema.exception.ConflictException;
import org.example.cinema.exception.ResourceNotFoundException;
import org.example.cinema.mapper.EntityMapper;
import org.example.cinema.repository.CountryRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CountryService {

    private static final String COUNTRY_NOT_FOUND = "Country not found: ";

    private final CountryRepository countryRepository;

    public CountryService(CountryRepository countryRepository) {
        this.countryRepository = countryRepository;
    }

    @Cacheable("countries")
    @Transactional(readOnly = true)
    public List<CountryResponse> findAll() {
        return countryRepository.findAll().stream().map(EntityMapper::toCountryResponse).toList();
    }

    @Cacheable(value = "country", key = "#id")
    @Transactional(readOnly = true)
    public CountryResponse findById(Long id) {
        return countryRepository.findById(id)
                .map(EntityMapper::toCountryResponse)
                .orElseThrow(() -> new ResourceNotFoundException(COUNTRY_NOT_FOUND + id));
    }

    @Transactional
    @CacheEvict(value = {"countries", "country"}, allEntries = true)
    public CountryResponse create(CountryRequest request) {
        if (countryRepository.existsByName(request.name())) {
            throw new ConflictException("Country name already exists");
        }
        if (countryRepository.existsByIsoCode(request.isoCode().toUpperCase())) {
            throw new ConflictException("Country ISO code already exists");
        }
        Country country = new Country();
        country.setName(request.name());
        country.setIsoCode(request.isoCode().toUpperCase());
        return EntityMapper.toCountryResponse(countryRepository.save(country));
    }

    @Transactional
    @CacheEvict(value = {"countries", "country"}, allEntries = true)
    public CountryResponse update(Long id, CountryRequest request) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(COUNTRY_NOT_FOUND + id));
        country.setName(request.name());
        country.setIsoCode(request.isoCode().toUpperCase());
        return EntityMapper.toCountryResponse(countryRepository.save(country));
    }

    @Transactional
    @CacheEvict(value = {"countries", "country"}, allEntries = true)
    public void delete(Long id) {
        if (!countryRepository.existsById(id)) {
            throw new ResourceNotFoundException(COUNTRY_NOT_FOUND + id);
        }
        countryRepository.deleteById(id);
    }

    public Country getEntity(long id) {
        return getEntity(Long.valueOf(id));
    }

    public Country getEntity(Long id) {
        return countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(COUNTRY_NOT_FOUND + id));
    }
}
